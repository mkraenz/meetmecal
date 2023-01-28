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
      textColor={"gray.300"}
      borderColor={"transparent"}
      _hover={{
        borderColor: "gray.300",
      }}
    >
      Back
    </Button>
  );
};

export default BackButton;
