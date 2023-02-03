import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import { readFileSync } from "fs";
import { CognitoIdentityProvider } from "./components/CognitoIdentityProvider";
import { getFrontendServiceRolePolicy } from "./frontendServiceRolePolicy";

const config = new pulumi.Config();
const awsConfig = new pulumi.Config("aws");
const myFirstName = config.require("myFirstName");
const nextAuthSecret = config.requireSecret("nextAuthSecret");
const gitRepositoryUrl = config.require("gitRepositoryUrl");
const githubPersonalAccessToken = config.requireSecret(
  "githubPersonalAccessToken"
);
const myName = config.require("myName");
const myCompanyEmail = config.require("myCompanyEmail");
const awsAccountId = config.require("awsAccountId");
const baseUrlLocal = config.require("baseUrlLocal");
const baseUrlRemote = config.require("baseUrlRemote");
const userpoolAdminEmail = config.require("userpoolAdminEmail");
const region = awsConfig.require("region");

const stack = pulumi.getStack();
const project = pulumi.getProject();

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

const cognitoIP = new CognitoIdentityProvider(`cognito`, {
  adminEmail: userpoolAdminEmail,
  adminLoginOauthClientCallbackUrls: [
    `${baseUrlLocal}/api/auth/callback/cognito`,
    `${baseUrlRemote}/api/auth/callback/cognito`,
  ],
  namePrefix: `${project}-${stack}-${region}`,
  region,
});

// ####################### END AWS COGNITO #######################

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
  "${project}-${stack}-${region}-NextjsToDynamoDBUserAccessKey",
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
  accessToken: githubPersonalAccessToken, // current token expires on about 2023-03-01
  repository: gitRepositoryUrl,
});

const nextAppMainBranch = new aws.amplify.Branch("main", {
  appId: nextApp.id,
  branchName: "main",
  framework: "Next.js - SSR",
  stage: "PRODUCTION",
  enableAutoBuild: true,
});

export const tableName = dynamoDbTable.name;

export const nextAppDomain = nextApp.defaultDomain;
