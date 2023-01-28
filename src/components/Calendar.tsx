import { ArrowForwardIcon } from "@chakra-ui/icons";
import { Button, Heading, SlideFade, Text, VStack } from "@chakra-ui/react";
import type { FC } from "react";
import type { Slot } from "../state/app.context";
import { useAppState } from "../state/app.context";
import { formatDateNoTimezone, formatTimezone } from "../utils/date.utils";
import BackButton from "./BackButton";

interface Props {
  slots: Slot[];
  visible: boolean;
}

const CalendarSlotButton: FC<{ slot: Slot }> = ({ slot }) => {
  const { dispatch } = useAppState();
  const selectSlot = () => dispatch({ type: "setSlot", slot });
  return (
    <Button
      onClick={selectSlot}
      key={slot.start.getTime()}
      rightIcon={<ArrowForwardIcon />}
      variant={"ghost-grow"}
    >
      {formatDateNoTimezone(slot)}
    </Button>
  );
};

const Calendar: FC<Props> = ({ slots, visible }) => {
  const { state } = useAppState();
  return (
    // offsetY gets animated from 200px to 0px
    <SlideFade
      in={visible}
      hidden={!visible}
      offsetX={"200px"}
      transition={{ enter: { duration: 0.3 } }}
    >
      <VStack gap={1}>
        <Heading as="h4" size={"md"} mb={4}>
          {state.meetingType?.displayName}
        </Heading>
        <Heading as="h5" size="sm" mb={4}>
          {" "}
          Select a start time.
        </Heading>
        <Text textColor={"secondaryText"}>
          All times in {formatTimezone()} time
        </Text>
        {/* TODO handle no slots available */}
        {slots.map((slot) => (
          <CalendarSlotButton slot={slot} key={slot.start.getTime()} />
        ))}
        {/* <HStack justifyContent={"right"} minW="sm"> */}
        <BackButton />
        {/* </HStack> */}
      </VStack>
    </SlideFade>
  );
};

export default Calendar;
