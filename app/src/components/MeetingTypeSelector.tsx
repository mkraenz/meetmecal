import { ArrowForwardIcon } from "@chakra-ui/icons";
import { Button, Heading, SlideFade, VStack } from "@chakra-ui/react";
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
      variant={"ghost-grow"}
      onClick={selectType}
      key={type.id}
      rightIcon={<ArrowForwardIcon />}
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
        <Heading as="h5" size="sm" mb={4}>
          {" "}
          Select the meeting duration.
        </Heading>
        {types.map((type) => (
          <SelectorButton type={type} key={type.id} />
        ))}
      </VStack>
    </SlideFade>
  );
};

export default MeetingTypeSelector;
