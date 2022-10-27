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
