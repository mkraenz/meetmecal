import * as aws from "@pulumi/aws";
import * as awsNative from "@pulumi/aws-native";
import * as pulumi from "@pulumi/pulumi";
import { readFileSync } from "fs";
import { createCognitoIdentityProvider } from "./resources/CognitoIdentityProvider";
import { getFrontendServiceRolePolicy } from "./src/frontendServiceRolePolicy";

const config = new pulumi.Config();
const awsConfig = new pulumi.Config("aws");
const myFirstName = config.require("myFirstName");
const gitRepositoryUrl = config.require("gitRepositoryUrl");
const myName = config.require("myName");
const myCompanyEmail = config.require("myCompanyEmail");
const awsAccountId = config.require("awsAccountId");
const baseUrlLocal = config.require("baseUrlLocal");
const userpoolAdminEmail = config.require("userpoolAdminEmail");
const domainName = config.require("domainName");

const secretsStackName = config.require("secretsStackName"); // format: myorg/project/stack
const secrets = new pulumi.StackReference(secretsStackName);
const bookingConfirmationMailSmtpHost = secrets.getOutput(
  "mmcInfrastructureBookingConfirmationMailSmtpHost"
);
const bookingConfirmationMailSmtpUsername = secrets.getOutput(
  "mmcInfrastructureBookingConfirmationMailSmtpUsername"
);
const bookingConfirmationMailSmtpPassword = secrets.getOutput(
  "mmcInfrastructureBookingConfirmationMailSmtpPassword"
);
const nextAuthSecret = secrets.getOutput("mmcInfrastructureNextAuthSecret");

export const githubPersonalAccessToken = secrets.getOutput(
  "mmcInfrastructureGithubPersonalAccessToken"
);

const bookingConfirmationMailSmtpPort =
  config.getNumber("bookingConfirmationMailSmtpPort", { min: 1, max: 65535 }) ??
  465;

const region = awsConfig.require("region");

const stack = pulumi.getStack();
const project = pulumi.getProject();

const subdomain = "meet";
const fqdn = `${subdomain}.${domainName}`;
const baseUrlRemote = `https://${fqdn}`;

const dynamoDbTable = new aws.dynamodb.Table(
  `${project}-${stack}-${region}-db`,
  {
    attributes: [
      {
        name: "pk",
        type: "S",
      },
      {
        name: "sk",
        type: "S",
      },
      {
        name: "gs1pk",
        type: "S",
      },
      {
        name: "gs1sk",
        type: "S",
      },
    ],
    hashKey: "pk",
    rangeKey: "sk",
    billingMode: "PROVISIONED",
    readCapacity: 1,
    writeCapacity: 1,
    globalSecondaryIndexes: [
      {
        name: "reversekeyindex",
        hashKey: "sk",
        rangeKey: "pk",
        projectionType: "ALL",
        readCapacity: 1,
        writeCapacity: 1,
      },
      {
        name: "gs1",
        hashKey: "gs1pk",
        rangeKey: "gs1sk",
        projectionType: "ALL",
        readCapacity: 1,
        writeCapacity: 1,
      },
    ],
    ttl: {
      attributeName: "ttl",
      enabled: true,
    },
    streamEnabled: true,
    streamViewType: "NEW_IMAGE",
  }
);

const bookingCreatedFnLogGroup = new aws.cloudwatch.LogGroup(
  "booking-created-fn",
  { retentionInDays: 3 }
);
const bookingCreatedFnLoggingPolicyDocument = aws.iam.getPolicyDocument({
  statements: [
    {
      effect: "Allow",
      actions: [
        "logs:CreateLogGroup", // this can pbly be removed
        "logs:CreateLogStream",
        "logs:PutLogEvents",
      ],
      // TODO use arn:aws:logs:<region>:<account-id>:log-group:<log_group_name>:*
      resources: ["arn:aws:logs:*:*:*"],
    },
  ],
});
const bookingCreatedFnLoggingPolicy = new aws.iam.Policy("booking-created-fn", {
  path: "/",
  description: "Logging policy for booking created lambda function",
  policy: bookingCreatedFnLoggingPolicyDocument.then((doc) => doc.json),
});

const bookingCreatedFnRole = new aws.iam.Role("booking-created-fn", {
  assumeRolePolicy: aws.iam.assumeRolePolicyForPrincipal({
    Service: "lambda.amazonaws.com",
  }),
});
const bookingCreatedFnPolicyAttachment = new aws.iam.RolePolicyAttachment(
  "booking-created-fn",
  {
    role: bookingCreatedFnRole.name,
    policyArn: bookingCreatedFnLoggingPolicy.arn,
  }
);

const bookingCreatedFn = new aws.lambda.Function("booking-created", {
  code: new pulumi.asset.AssetArchive({
    ".": new pulumi.asset.FileArchive("../lambdas/dist/on-booking-created"),
  }),
  handler: "index.lambdaHandler",
  runtime: "nodejs16.x",
  architectures: ["x86_64"],
  environment: {
    variables: {
      SMTP_HOST: bookingConfirmationMailSmtpHost,
      SMTP_USERNAME: bookingConfirmationMailSmtpUsername,
      SMTP_PASSWORD: bookingConfirmationMailSmtpPassword,
      SMTP_PORT: bookingConfirmationMailSmtpPort.toString(),
      USE_SSL: "true",
      MY_EMAIL_ADDRESS: myCompanyEmail,
      FROM_ADDRESS: myCompanyEmail,
      MY_NAME: myName,
    },
  },
  description:
    "Email notifications sending via Lambda triggered by DynamoDB Stream events on booking creation (with EventBridge Pipe as transport)",
  role: bookingCreatedFnRole.arn,
});

const pipeRole = new awsNative.iam.Role("booking-created-pipe", {
  assumeRolePolicyDocument: aws.iam.assumeRolePolicyForPrincipal({
    Service: "pipes.amazonaws.com",
  }),
  policies: [
    {
      policyName: `${project}-${region}-${stack}-source-policy`,
      policyDocument: dynamoDbTable.streamArn.apply((streamArn) =>
        aws.iam
          .getPolicyDocument({
            version: "2012-10-17",
            statements: [
              {
                effect: "Allow",
                actions: [
                  "dynamodb:DescribeStream",
                  "dynamodb:GetRecords",
                  "dynamodb:GetShardIterator",
                  "dynamodb:ListStreams",
                ],
                resources: [streamArn],
              },
            ],
          })
          .then((p) => p.json)
      ),
    },
    {
      policyName: `${project}-${region}-${stack}-target-policy`,
      policyDocument: bookingCreatedFn.arn.apply((bookingCreatedFnArn) =>
        aws.iam
          .getPolicyDocument({
            version: "2012-10-17",
            statements: [
              {
                effect: "Allow",
                actions: ["lambda:InvokeFunction"],
                resources: [bookingCreatedFnArn],
              },
            ],
          })
          .then((p) => p.json)
      ),
    },
  ],
});

/** EventBridge Pipe to listen to create-item events in DDB table and trigger bookingCreated lambda function */
const bookingCreatedPipe = new awsNative.pipes.Pipe("booking-created", {
  description:
    "Pipes to connect to DDB stream listening only for creation changes",
  roleArn: pipeRole.arn,
  target: bookingCreatedFn.arn,
  targetParameters: {
    lambdaFunctionParameters: {
      invocationType: "FIRE_AND_FORGET",
    },
  },
  source: dynamoDbTable.streamArn,
  sourceParameters: {
    filterCriteria: {
      filters: [
        {
          // pattern derived from https://docs.aws.amazon.com/lambda/latest/dg/with-ddb-example.html
          // pk = "booking" comes from db.ts
          // Note: in eventbridge we must use `"S": ["booking"]` for equality match even though we want to match for `"S": "booking"`. See https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-event-patterns.html
          // Can we use multiline here? In SAM it was not possible for some reason.
          pattern:
            '{"eventName":["INSERT"],"dynamodb":{"NewImage":{"pk":{"S":["booking"]}}}}',
        },
      ],
    },
    dynamoDBStreamParameters: {
      startingPosition: "LATEST",
      batchSize: 1,
      // TODO add dlq
      // deadLetterConfig: {
      //   arn: ''
      // }
    },
  },
});

const cognitoIP = createCognitoIdentityProvider({
  adminEmail: userpoolAdminEmail,
  adminLoginOauthClientCallbackUrls: [
    `${baseUrlLocal}/api/auth/callback/cognito`,
    `https://${fqdn}/api/auth/callback/cognito`,
  ],
  domainName: `meetmecal-${stack}-${region}`,
});

const nextAppServiceRole = new aws.iam.Role("nextAppServiceRole", {
  assumeRolePolicy: aws.iam.assumeRolePolicyForPrincipal({
    Service: "amplify.amazonaws.com",
  }),
  inlinePolicies: [
    {
      name: "nextAppServiceRolePolicy",
      policy: JSON.stringify(
        getFrontendServiceRolePolicy(region, awsAccountId)
      ),
    },
  ],
});

const nextjsToDynamoDBUser = new aws.iam.User(
  `${project}-${stack}-${region}-nextjs-to-dynamodb`
);
const nextjsToDynamoDBUserAccessKey = new aws.iam.AccessKey(
  "NextjsToDynamoDBUserAccessKey",
  { user: nextjsToDynamoDBUser.name }
);

dynamoDbTable.arn.apply((arn) => {
  const nextjsToDynamoDBPolicy = new aws.iam.UserPolicy(
    `${project}-${stack}-${region}-NextjsToDynamoDBPolicy`,
    {
      user: nextjsToDynamoDBUser.name,
      policy: aws.iam
        .getPolicyDocument({
          version: "2012-10-17",
          statements: [
            {
              sid: "CrudDynamodb",
              effect: "Allow",
              actions: [
                "dynamodb:putItem",
                "dynamodb:getItem",
                "dynamodb:updateItem",
                "dynamodb:deleteItem",
                "dynamodb:query",
              ],
              resources: [arn, `${arn}/index/*`],
            },
          ],
        })
        .then((doc) => doc.json),
    },
    {
      dependsOn: [dynamoDbTable],
    }
  );
});

/** @see https://www.pulumi.com/registry/packages/aws/api-docs/amplify/app/ */
const nextApp = new aws.amplify.App(`${project}-${stack}-${region}-app`, {
  buildSpec: readFileSync("frontendBuildSpec.yaml", "utf-8"),
  iamServiceRoleArn: nextAppServiceRole.arn,
  platform: "WEB_COMPUTE",
  environmentVariables: {
    BACKEND_BASE_URL: "http://localhost:3001", // this is not used anymore. remove it.
    MY_AWS_COGNITO_CLIENT_ID: cognitoIP.userpoolClient.id,
    MY_AWS_COGNITO_CLIENT_SECRET: cognitoIP.userpoolClient.clientSecret,
    MY_AWS_COGNITO_ISSUER: pulumi.interpolate`https://cognito-idp.${region}.amazonaws.com/${cognitoIP.userpool.id}`,
    MY_AWS_DYNAMODB_TABLE_NAME: dynamoDbTable.name,
    MY_AWS_REGION: region,
    MY_AWS_USER_ACCESS_KEY_ID: pulumi.interpolate`${nextjsToDynamoDBUserAccessKey.id}`,
    MY_AWS_USER_ACCESS_KEY_SECRET: pulumi.interpolate`${nextjsToDynamoDBUserAccessKey.secret}`,
    MY_FIRST_NAME: myFirstName,
    NEXTAUTH_SECRET: nextAuthSecret,
    NEXTAUTH_URL: baseUrlRemote,
    NEXT_PUBLIC_MY_COMPANY_EMAIL: myCompanyEmail,
    NEXT_PUBLIC_MY_FIRST_NAME: myFirstName,
    NEXT_PUBLIC_MY_NAME: myName,
    AMPLIFY_MONOREPO_APP_ROOT: "app",
  },
  customRules: [
    {
      // if the resource is not found, return index.html
      source: "/<*>",
      status: "404",
      target: "/index.html",
    },
  ],
  enableAutoBranchCreation: true,
  autoBranchCreationPatterns: ["main"],
  // https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/amplify_app Fixing the following error:
  // "BadRequestException: You should at least provide one valid token" because of authentication issues. See the section "Repository with Tokens" below.
  // https://docs.aws.amazon.com/amplify/latest/userguide/setting-up-GitHub-access.html amplify needs `admin:repo_hook` scope
  accessToken: githubPersonalAccessToken, // next token expires on Sun, Jun 18 2023
  repository: gitRepositoryUrl,
});

const nextAppMainBranch = new aws.amplify.Branch("main", {
  appId: nextApp.id,
  branchName: "main",
  framework: "Next.js - SSR",
  stage: "PRODUCTION",
  enableAutoBuild: true,
});

new aws.amplify.DomainAssociation("domain", {
  appId: nextApp.id,
  domainName,
  subDomains: [
    {
      branchName: nextAppMainBranch.branchName,
      prefix: subdomain,
    },
  ],
  waitForVerification: true,
});

export const tableName = dynamoDbTable.name;

export const amplifyNextAppId = nextApp.id;
export const amplifyNextAppMainBranchName = nextAppMainBranch.branchName;
export const cognitoIssuerUrl = pulumi.interpolate`https://cognito-idp.${region}.amazonaws.com/${cognitoIP.userpool.id}`;
export const localEnvFile = pulumi.interpolate`NEXTAUTH_SECRET=${nextAuthSecret}
NEXTAUTH_URL=http://localhost:3000

BACKEND_BASE_URL=http://localhost:3001
MY_FIRST_NAME=Jane

NEXT_PUBLIC_MY_COMPANY_EMAIL=hello@example.com
NEXT_PUBLIC_MY_NAME=Jane Doe
NEXT_PUBLIC_MY_FIRST_NAME=Jane

MY_AWS_USER_ACCESS_KEY_ID=${nextjsToDynamoDBUserAccessKey.id}
MY_AWS_USER_ACCESS_KEY_SECRET=${nextjsToDynamoDBUserAccessKey.secret}
MY_AWS_DYNAMODB_TABLE_NAME=${tableName}
MY_AWS_REGION=${region}
MY_AWS_COGNITO_CLIENT_ID=${cognitoIP.userpoolClient.id}
MY_AWS_COGNITO_CLIENT_SECRET=${cognitoIP.userpoolClient.clientSecret}
MY_AWS_COGNITO_ISSUER=${cognitoIssuerUrl}
`;

export const NOTE = "you may need to redeploy the amplify app. See README.md";
