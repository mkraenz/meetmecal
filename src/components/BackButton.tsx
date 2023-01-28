import { ArrowBackIcon } from "@chakra-ui/icons";
import { Button } from "@chakra-ui/react";
import type { FC } from "react";
import { useAppState } from "../state/app.context";

const BackButton: FC = () => {
  const { dispatch } = useAppState();
  const goBack = () => dispatch({ type: "previousStep" });

  return (
    <Button
      leftIcon={<ArrowBackIcon />}
      onClick={goBack}
      variant={"outline"}
      textColor={"secondaryText"}
      borderColor={"transparent"}
      _hover={{
        borderColor: "secondaryText",
      }}
      // _focus is used when using tab to navigate the page
      _focus={{
        transform: "scale(1.05)",
        borderColor: "brand.500",
        outlineColor: "brand.500",
      }}
    >
      Back
    </Button>
  );
};

export default BackButton;
