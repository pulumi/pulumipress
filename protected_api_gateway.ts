// Copyright Pulumi Corporation, 2020. All Rights Reserved.

import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";
import * as apigateway from "@pulumi/aws-apigateway";
import * as url from "url";

// Callback function for creating the associated infrastructure and
// API Gateway for our application/
interface ProtectedApiGatewayAppCreationBlock {
    (awsProvider: aws.Provider): apigateway.RestAPI;
}

// The values needed for creating the protected API Gateway.
interface ProtectedApiGatewayOpts {
    domainName: string;
}

/**
 * createProtectedApiGateway creates the API Gateway and all associated infrastructure
 * needed to protect the gateway. This is copied from the implementation in github-community-issues-report.
 * Source: https://github.com/pulumi/home/tree/master/infrastructure/github-community-issues-report
 *
 * @param opts The options for creating the protected API Gateway.
 * @param appCreationBlock The callback function for creating the needed API Gateway and related infrastructure.
 */
export function createProtectedApiGateway(opts: ProtectedApiGatewayOpts,
    appCreationBlock: ProtectedApiGatewayAppCreationBlock): apigateway.RestAPI {
    const { domainName } = opts;

    // Copied the auth implementation from github-community-issues-report.
    // https://github.com/pulumi/home/tree/master/infrastructure/github-community-issues-report

    // Import our generic "auth" stack, which we'll use to hook up our API.
    const auth = new pulumi.StackReference("pulumi/corp.pulumi.com-auth/" + pulumi.getStack());

    // We need the lambda function for auth and the cert to create a new CF distribution.
    const lambdaArn = auth.getOutput("lambdaArn");
    const certificateArn = auth.getOutput("certificateArn");

    // We'll create our Route 53 record in this hosted zone
    const hostedZoneId = auth.getOutput("hostedZoneId");

    // Create a 1st class provider so we can expicitly connect to an assumeRole account.
    let providerConfig: aws.ProviderArgs = {
        region: aws.config.region,
    };

    const awsProvider = new aws.Provider("aws", providerConfig);

    // Log the account number so we know we are targetting the right one!
    aws.getCallerIdentity({ provider: awsProvider, async: true }).then(identity => {
        pulumi.log.info(`Deploying into AWS account: ${identity.accountId}`, awsProvider);
    });

    // Create a provider to use in us-east-1 so that we can create an ACM certificate there,
    // which is required for Cloudfront to use (also in us-east-1).
    const awsEastProvider = new aws.Provider("prod-us-east-1", {
        region: "us-east-1",
    });

    // Check that our domain matches the hosted zone.
    const hostedZone = hostedZoneId.apply(hzid => aws.route53.getZone({
        zoneId: hzid
    }, { provider: awsEastProvider, async: true }));

    hostedZone.name.apply(zoneName => {
        if (!(domainName).endsWith(zoneName)) { // Hosted zone names end with a '.'
            throw new Error(`Domain name ${domainName} does not match hosted zone ${zoneName}`);
        }
    });

    // Create the application and its infrastructure.
    const api = appCreationBlock(awsProvider);

    // API Key & Cloudfront --- Copied the auth implementation from github-community-issues-report.
    // https://github.com/pulumi/home/tree/master/infrastructure/github-community-issues-report

    // NOTE: We are creating a static API gateway key here, but this results in essentially a fixed
    // credential. So as time goes on, it essentially becomes a liability. Ideally we would have some
    // sort of automated rotation in-place. But simply changing the underlying resource from time
    // to time is probably sufficient.
    // Issue: https://github.com/pulumi/home/issues/980
    const apiKey = new aws.apigateway.ApiKey("apiKey", {
    }, { provider: awsProvider });

    const apiUsagePlan = new aws.apigateway.UsagePlan("apiUsagePlan", {
        apiStages: [
            {
                apiId: api.api.id,
                stage: api.stage.stageName
            }
        ]
    }, { provider: awsProvider });

    const apiUsagePlanKey = new aws.apigateway.UsagePlanKey("keyPlan", {
        keyId: apiKey.id,
        keyType: "API_KEY",
        usagePlanId: apiUsagePlan.id
    }, { provider: awsProvider });

    // logsBucket is an S3 bucket that will contain the CDN's request logs.
    const logsBucket = new aws.s3.Bucket(`${domainName}-requestLogs`,
        {
            acl: "private",
            forceDestroy: true,
        }, { provider: awsEastProvider });

    const tenMinutes = 60 * 10;

    const siteUrl = api.url.apply(u => new url.URL(u));
    // Cloudfront doesn't accept paths with trailing '/'
    const originPath = siteUrl.pathname.apply(p => p.endsWith("/") ? p.slice(0, -1) : p);

    const cdn = new aws.cloudfront.Distribution(`${domainName}-cdn`, {
        enabled: true,
        // Note that Cloudfront will choose the _more specific_ CNAME (as long as the distributions are in the same account).
        aliases: [ domainName ],

        // Configure the API Gateway as the origin passing the API key on requests
        origins: [
            {
                originId: api.url,
                domainName: siteUrl.hostname,
                originPath: originPath,
                customOriginConfig: {
                    originProtocolPolicy: "https-only",
                    httpPort: 80,
                    httpsPort: 443,
                    originSslProtocols: ["TLSv1.2"],
                },
                customHeaders: [
                    {
                        name: "x-api-key",
                        value: apiKey.value
                    }
                ]
            },
        ],

        // A CloudFront distribution can configure different cache behaviors based on the request path.
        // Here we just specify a single, default cache behavior which is just read-only requests to S3.
        defaultCacheBehavior: {
            targetOriginId: api.url,

            viewerProtocolPolicy: "redirect-to-https",
            allowedMethods: ["HEAD", "DELETE", "POST", "GET", "OPTIONS", "PUT", "PATCH"],
            cachedMethods: ["GET", "HEAD", "OPTIONS"],

            forwardedValues: {
                cookies: { forward: "none" },
                queryString: false,
            },

            minTtl: 0,
            defaultTtl: tenMinutes,
            maxTtl: tenMinutes,

            // Include our authorization function
            lambdaFunctionAssociations: [
                {
                    eventType: "viewer-request",
                    lambdaArn: lambdaArn
                }
            ]
        },

        // "All" is the most broad distribution, and also the most expensive.
        // "100" is the least broad, and also the least expensive.
        priceClass: "PriceClass_100",

        restrictions: {
            geoRestriction: {
                restrictionType: "none",
            },
        },

        viewerCertificate: {
            acmCertificateArn: certificateArn,  // Per AWS, ACM certificate must be in the us-east-1 region.
            sslSupportMethod: "sni-only",
            minimumProtocolVersion: "TLSv1.2_2018",
        },

        loggingConfig: {
            bucket: logsBucket.bucketDomainName,
            includeCookies: false,
            prefix: `${domainName}/`,
        },

        waitForDeployment: false
    }, { provider: awsEastProvider });

    // Get the record name we need to create.
    const recordName = hostedZone.apply(hz => domainName.split("." + hz)[0]);
    const aliasRecord = new aws.route53.Record(
        domainName,
        {
            name: recordName,
            zoneId: hostedZoneId,
            type: "A",
            aliases: [
                {
                    name: cdn.domainName,
                    zoneId: cdn.hostedZoneId,
                    evaluateTargetHealth: true,
                },
            ],
        }, { provider: awsEastProvider });

    return api;
}