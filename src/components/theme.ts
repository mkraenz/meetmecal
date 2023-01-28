import {
  defineStyleConfig,
  extendTheme,
  withDefaultColorScheme,
} from "@chakra-ui/react";
import { mode } from "@chakra-ui/theme-tools";

const buttonStyle = defineStyleConfig({
  // Styles for the base style
  baseStyle: {},
  // Styles for the size variations
  sizes: {},
  // Styles for the visual style variations
  variants: {
    "ghost-grow": {
      bg: "transparent",
      minW: "sm",
      justifyContent: "space-between",
      _hover: {
        transform: "scale(1.05)",
        borderColor: "gray.300",
      },
      border: "1px",
      borderColor: "gray.500",
    },
    nav: {
      bg: "transparent",
      maxW: "sm",
      justifyContent: "space-between",
      _hover: {
        bg: "brand.700",
      },
    },
  },
  // The default `size` or `variant` values
  defaultProps: {},
});

export const theme = extendTheme(
  {
    colors: {
      brand: {
        50: "#EBFAEE",
        100: "#ebfaee",
        200: "#99e6ab",
        300: "#70db89",
        400: "#47d167",
        500: "#208036",
        600: "#248f3c",
        700: "#19662b",
        800: "#175028",
        900: "#153a24",
      },
      alternateText: "#333333",
    },
  },
  withDefaultColorScheme({ colorScheme: "brand" }),
  {
    components: {
      Button: buttonStyle,
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
