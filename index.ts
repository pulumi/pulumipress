import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as apigateway from "@pulumi/aws-apigateway";
import * as staticwebsite from "@pulumi/aws-static-website"
import {testGH} from "./api/github"
import {createProtectedApiGateway} from "./protected_api_gateway"
const config = new pulumi.Config();

async function getAwsAccountId() {
    let callerIdentity = await aws.getCallerIdentity();
    return callerIdentity.accountId;
}

// Create a policy document for our KMS key that grants full access to the root user. This is necessary to allow
// IAM policies to grant rights to this key.
async function getKeyPolicyDocument() {
    const accountId = await getAwsAccountId();
    const keyPolicyDocument: aws.iam.PolicyDocument = {
        Version: "2012-10-17",
        Statement: [
            {
                Effect: "Allow",
                Principal: { AWS: `arn:aws:iam::${accountId}:root` },
                Action: "kms:*",
                Resource: "*",
            },
        ],
    };
    return JSON.stringify(keyPolicyDocument);
}

// Create the KMS key we will use to generate and decrypt application data keys.
const kmsKey = new aws.kms.Key("pulumi-press-kms-key", {
    enableKeyRotation: true,
    policy: getKeyPolicyDocument(),
});

const domainName = config.require("domainName");

// export let apiOut: apigateway.RestAPI;

createProtectedApiGateway({ domainName }, (awsprovider) => {

    // A Lambda function to invoke
    const fn = new aws.lambda.CallbackFunction("fn", {
        callback: async (ev: {body: string}, ctx) => {
            return {
                statusCode: 200,
                body: JSON.stringify({
                    date: new Date().toISOString()
                    // ev: JSON.stringify(ev.body),
                    // ctx: JSON.stringify(ctx),
                }),
            };
        }
    }, {
        provider: awsprovider,
    })

    const ghFn = new aws.lambda.CallbackFunction("ghFn", {
        callback: testGH,
        runtime: "nodejs14.x",
        environment: {
            variables: {
                GITHUB_TOKEN: process.env.GITHUB_TOKEN || "",
            }
        },
        kmsKeyArn: kmsKey.arn,
    }, {
        provider: awsprovider,
    })



    // A REST API to route requests to HTML content and the Lambda function
    const api = new apigateway.RestAPI("api", {
        routes: [
            { path: "/", localPath: "web/build", apiKeyRequired: true},
            { path: "/date", method: "GET", eventHandler: fn, apiKeyRequired: true },
            { path: "/gh", method: "POST", eventHandler: ghFn, apiKeyRequired: true },
        ],
    }, {
        provider: awsprovider,
    });

    // apiOut = api;

    return api;
})



// const websiteArgs =  {
//     sitePath: "./web/build",
//     targetDomain: "holung.com",
//     withCDN: true
// } as staticwebsite.WebsiteArgs

// const web = new staticwebsite.Website("test", websiteArgs);

// export const bucketName = web.bucketName;
// export const bucketWebsiteURL = web.bucketWebsiteURL;


// const apiOrigin: aws.types.input.cloudfront.DistributionOrigin = {
//     originId: api.api.arn,
//     domainName: api.url.apply(url => url.replace("https://", "").replace("/stage/", "")),
//     originPath: "stage",
//     customOriginConfig: {
//         originProtocolPolicy: "http-only",
//         httpPort: 80,
//         httpsPort: 443,
//         originSslProtocols: ["TLSv1.2"],
//     },
// };

// const distributionArgs: aws.cloudfront.DistributionArgs = {
//     enabled: true,

//     // Alternate aliases the CloudFront distribution can be reached at, in addition to https://xxxx.cloudfront.net.
//     // Required if you want to access the distribution via config.targetDomain as well.

//     aliases: [],

//     // We only specify one origin for this distribution, the S3 content bucket.
//     origins: [
//         apiOrigin
//     ],

//     defaultRootObject: "",

//     // A CloudFront distribution can configure different cache behaviors based on the request path.
//     // Here we just specify a single, default cache behavior which is just read-only requests to S3.
//     defaultCacheBehavior: {
//         targetOriginId: api.api.arn,

//         viewerProtocolPolicy: "redirect-to-https",
//         allowedMethods: ["GET", "HEAD", "OPTIONS"],
//         cachedMethods: ["GET", "HEAD", "OPTIONS"],

//         forwardedValues: {
//             headers: [ "Website-Version" ],
//             cookies: { forward: "none" },
//             queryString: false,
//         },

//         minTtl: 0,
//         defaultTtl: 300,
//         maxTtl: 300,

//     },


//     restrictions: {
//         geoRestriction: {
//             restrictionType: "none",
//         },
//     },

//     viewerCertificate: {
//         cloudfrontDefaultCertificate: true,
//         sslSupportMethod: "sni-only",
//     },
// };

// const cdn = new aws.cloudfront.Distribution(
//     "website-cdn",
//     distributionArgs,
// );

// export const cdnUrl = cdn.domainName;