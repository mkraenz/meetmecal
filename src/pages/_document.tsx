import { Head, Html, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Fixes mobile not in full width https://stackoverflow.com/questions/67747138/next-js-app-with-chakra-ui-not-full-width-on-mobile-devices#comment119748948_67747138 */}
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1"
        ></meta>

        <link rel="icon" href="/favicon.ico" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
