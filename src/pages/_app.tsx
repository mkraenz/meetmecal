import {
  ChakraProvider,
  extendTheme,
  withDefaultColorScheme,
} from "@chakra-ui/react";
import { mode } from "@chakra-ui/theme-tools";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { type AppType } from "next/app";
import Head from "next/head";
import { AppStateProvider } from "../state/app.context";
import { api } from "../utils/api";

// TODO temporary workaround for react date picker text. will be removed once I switch to an actual calendar for availabilities
import "../components/admin/availabilities/AddAvailability.css";

const theme = extendTheme(
  {
    colors: {
      brand: {
        50: "#EBFAEE",
        500: "#208036",
        900: "#153a24",
      },
    },
  },
  withDefaultColorScheme({ colorScheme: "brand" }),
  {
    components: {
      Button: {
        defaultProps: {
          variant: "outline", // default is solid
        },
      },
    },
  },
  {
    styles: {
      global: (props: any) => ({
        body: {
          fontFamily: "body",
          color: mode("#f7e6dd", "whiteAlpha.900")(props), // text color
          bg: mode("brand.900", "gray.800")(props),
          lineHeight: "base",
        },
      }),
    },
  }
);

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
      <AppStateProvider>
        <SessionProvider session={session}>
          <ChakraProvider theme={theme}>
            <Component {...pageProps} />
          </ChakraProvider>
        </SessionProvider>
      </AppStateProvider>
    </>
  );
};

export default api.withTRPC(MyApp);
