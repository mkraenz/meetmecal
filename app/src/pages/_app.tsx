import { ChakraProvider } from "@chakra-ui/react";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { type AppType } from "next/app";
import Head from "next/head";
import { theme } from "../components/theme";
import { AppStateProvider } from "../state/app.context";
import { api } from "../utils/api";

// . will be removed once I switch to an actual calendar for availabilities
import "./global-overwrites.css";

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <>
      <Head>
        {/* Fixes mobile not in full width https://stackoverflow.com/questions/67747138/next-js-app-with-chakra-ui-not-full-width-on-mobile-devices#comment119748948_67747138. viewport must be in _app, see https://nextjs.org/docs/messages/no-document-viewport-meta */}
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1"
        ></meta>
      </Head>
      <SessionProvider session={session}>
        <AppStateProvider>
          <ChakraProvider theme={theme}>
            <Component {...pageProps} />
          </ChakraProvider>
        </AppStateProvider>
      </SessionProvider>
    </>
  );
};

export default api.withTRPC(MyApp);
