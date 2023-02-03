import * as aws from "@pulumi/aws";
import { UserPool, UserPoolClient, UserPoolDomain } from "@pulumi/aws/cognito";
import * as pulumi from "@pulumi/pulumi";

type Url = string;
export interface CognitoIdentityProviderProps {
  namePrefix: string;
  adminLoginOauthClientCallbackUrls: Url[];
  adminEmail: string;
  region: string;
}

export class CognitoIdentityProvider extends pulumi.ComponentResource {
  public readonly userpool: UserPool;
  public readonly userpoolClient: UserPoolClient;
  public readonly userpoolDomain: UserPoolDomain;
  public readonly adminUser: aws.cognito.User;

  constructor(
    name: string,
    args: CognitoIdentityProviderProps,
    opts?: pulumi.ComponentResourceOptions
  ) {
    super("mkraenz:mmc-infrastructure:CognitoIdentityProvider", name, {}, opts);

    this.userpool = new aws.cognito.UserPool(
      `${args.namePrefix}-userpool`,
      undefined,
      { parent: this }
    );

    this.userpoolClient = new aws.cognito.UserPoolClient(
      `${args.namePrefix}-nextjs-admin-login`,
      {
        userPoolId: this.userpool.id,
        allowedOauthFlows: ["code"],
        generateSecret: true,
        allowedOauthFlowsUserPoolClient: true,
        allowedOauthScopes: ["email", "openid", "profile"],
        callbackUrls: args.adminLoginOauthClientCallbackUrls,
        logoutUrls: [], // TODO
        supportedIdentityProviders: ["COGNITO"],
        preventUserExistenceErrors: "ENABLED",
      }
    );

    this.userpoolDomain = new aws.cognito.UserPoolDomain(
      `${args.namePrefix}-domain`,
      {
        userPoolId: this.userpool.id,
        domain: args.namePrefix,
      }
    );

    this.adminUser = new aws.cognito.User("admin", {
      userPoolId: this.userpool.id,
      username: args.adminEmail,
      attributes: {
        email: args.adminEmail,
      },
    });

    this.registerOutputs({
      adminEmail: args.adminEmail,
      userpoolId: this.userpool.id,
      issuerUrl: pulumi.interpolate`https://cognito-idp.${args.region}.amazonaws.com/${this.userpool.id}`,
      userpoolClientSecret: this.userpoolClient.clientSecret,
      userpoolClientId: this.userpoolClient.id,
    });
  }
}
