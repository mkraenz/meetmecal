import { ArrowBackIcon } from "@chakra-ui/icons";
import { Button } from "@chakra-ui/react";
import type { FC } from "react";
import { useState } from "react";
import { useAppState } from "../state/app.context";

const BackButton: FC = () => {
  const { dispatch } = useAppState();
  const [hovering, setHovering] = useState(false);
  const goBack = () => dispatch({ type: "previousStep" });

  return (
    <Button
      leftIcon={<ArrowBackIcon />}
      onClick={goBack}
      variant={hovering ? "outline" : "ghost"}
      textColor={"gray.300"}
      _hover={{
        borderColor: "gray.300",
      }}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      Back
    </Button>
  );
};

export default BackButton;
