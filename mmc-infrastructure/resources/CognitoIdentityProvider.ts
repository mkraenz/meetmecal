import * as aws from "@pulumi/aws";

interface Args {
  adminLoginOauthClientCallbackUrls: string[];
  domainName: string;
  adminEmail: string;
}

let ranAlready = false;

export const createCognitoIdentityProvider = (args: Args) => {
  if (ranAlready) {
    throw new Error(
      "CognitoIdentityProvider can only be called once (per pulumi up)"
    );
  }
  ranAlready = true;
  const userpool = new aws.cognito.UserPool("userpool");

  const userpoolClient = new aws.cognito.UserPoolClient("userpool-client", {
    userPoolId: userpool.id,
    allowedOauthFlows: ["code"],
    generateSecret: true,
    allowedOauthFlowsUserPoolClient: true,
    allowedOauthScopes: ["email", "openid", "profile"],
    callbackUrls: args.adminLoginOauthClientCallbackUrls,
    logoutUrls: [], // TODO
    supportedIdentityProviders: ["COGNITO"],
    preventUserExistenceErrors: "ENABLED",
  });

  const userpoolDomain = new aws.cognito.UserPoolDomain("userpool-domain", {
    userPoolId: userpool.id,
    domain: args.domainName,
  });

  const adminUser = new aws.cognito.User("userpool-admin-user", {
    userPoolId: userpool.id,
    username: args.adminEmail,
    attributes: {
      email: args.adminEmail,
    },
  });
  return {
    userpool,
    userpoolClient,
    userpoolDomain,
    adminUser,
  };
};
