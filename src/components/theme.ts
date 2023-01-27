import { extendTheme, withDefaultColorScheme } from "@chakra-ui/react";
import { mode } from "@chakra-ui/theme-tools";

export const theme = extendTheme(
  {
    colors: {
      brand: {
        50: "#EBFAEE",
        // 100: "#ebfaee",
        // 200: "#99e6ab",
        // 300: "#70db89",
        // 400: "#47d167",
        500: "#208036",
        // 600: "#248f3c",
        // 700: "#19662b",
        // 800: "#175028",
        900: "#153a24",
      },
      alternateText: "#333333",
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
      Drawer: {
        baseStyle: {
          dialog: {
            bg: "brand.900",
            color: "white",
          },
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
