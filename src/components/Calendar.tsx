import { ArrowForwardIcon } from "@chakra-ui/icons";
import { Button, Heading, SlideFade, VStack } from "@chakra-ui/react";
import type { FC } from "react";
import type { Slot } from "../state/app.context";
import { useAppState } from "../state/app.context";
import { formatDate } from "../utils/date.utils";
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
      minW={"sm"}
      key={slot.start.getTime()}
      rightIcon={<ArrowForwardIcon />}
      justifyContent={"space-between"}
      _hover={{
        transform: "scale(1.05)",
        borderColor: "gray.300",
      }}
      borderColor={"gray.300"}
    >
      {formatDate(slot)}
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
