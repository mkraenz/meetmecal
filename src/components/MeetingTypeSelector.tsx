import { ArrowForwardIcon } from "@chakra-ui/icons";
import { Button, SlideFade, VStack } from "@chakra-ui/react";
import type { FC } from "react";
import type { MeetingType } from "../state/app.context";
import { useAppState } from "../state/app.context";

interface Props {
  types: MeetingType[];
  visible: boolean;
}

const SelectorButton: FC<{ type: MeetingType }> = ({ type }) => {
  const { dispatch } = useAppState();
  const selectType = () =>
    dispatch({ type: "setMeetingType", meetingType: type });
  return (
    <Button
      onClick={selectType}
      minW={"sm"}
      key={type.id}
      rightIcon={<ArrowForwardIcon />}
      justifyContent={"space-between"}
      _hover={{
        transform: "scale(1.05)",
        borderColor: "gray.300",
      }}
      borderColor={"gray.300"}
    >
      {type.displayName}
    </Button>
  );
};

const MeetingTypeSelector: FC<Props> = ({ types, visible }) => {
  return (
    <SlideFade
      in={visible}
      offsetX={"200px"}
      hidden={!visible}
      transition={{ enter: { duration: 0.3 } }}
    >
      <VStack gap={1}>
        {types.map((type) => (
          <SelectorButton type={type} key={type.id} />
        ))}
      </VStack>
    </SlideFade>
  );
};

export default MeetingTypeSelector;
