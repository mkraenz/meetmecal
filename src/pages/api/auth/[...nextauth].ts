import NextAuth, { type NextAuthOptions } from "next-auth";
import CognitoProvider from "next-auth/providers/cognito";

import { env } from "../../../env/server.mjs";

export const authOptions: NextAuthOptions = {
  callbacks: {
    session({ session, token }) {
      (session as any).accessToken = token;
      if (session.user && token.sub) session.user.id = token.sub;
      return session;
    },
  },
  // Configure one or more authentication providers
  providers: [
    CognitoProvider({
      clientId: env.MY_AWS_COGNITO_CLIENT_ID,
      clientSecret: env.MY_AWS_COGNITO_CLIENT_SECRET,
      issuer: env.MY_AWS_COGNITO_ISSUER,
    }),

    /**
     * ...add more providers here
     *
     * Most other providers require a bit more work than the Discord provider.
     * For example, the GitHub provider requires you to add the
     * `refresh_token_expires_in` field to the Account model. Refer to the
     * NextAuth.js docs for the provider you want to use. Example:
     * @see https://next-auth.js.org/providers/github
     */
  ],
};

export default NextAuth(authOptions);
