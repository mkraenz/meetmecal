import { ChevronRightIcon } from "@chakra-ui/icons";
import { HStack, Text } from "@chakra-ui/react";
import type { FC } from "react";
import { useAppState } from "../state/app.context";

interface Props {}

const Navigation: FC<Props> = (props) => {
  const { state } = useAppState();
  return (
    <HStack
      spacing={8}
      transform={"skew(-14deg)"}
      border="1px"
      p={2}
      borderRadius={8}
      borderColor={"secondaryText"}
    >
      <Text transform={"skew(14deg)"}>Duration</Text>
      <ChevronRightIcon color="secondaryText" />
      <Text transform={"skew(14deg)"}>Time</Text>
      <ChevronRightIcon color="secondaryText" />
      <Text transform={"skew(14deg)"}>Contact</Text>
    </HStack>
  );
};

export default Navigation;
