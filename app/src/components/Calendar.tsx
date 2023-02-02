import { ArrowForwardIcon } from "@chakra-ui/icons";
import {
  Button,
  Heading,
  Link,
  SlideFade,
  Text,
  VStack,
} from "@chakra-ui/react";
import type { FC } from "react";
import { env } from "../env/client.mjs";
import type { Slot } from "../state/app.context";
import { useAppState } from "../state/app.context";
import { formatDateNoTimezone, formatTimezone } from "../utils/date.utils";
import BackButton from "./BackButton";

interface Props {
  slots: Slot[];
  visible: boolean;
}

const NoSlotsAvailable: FC = () => {
  const name = env.NEXT_PUBLIC_MY_FIRST_NAME;
  const email = env.NEXT_PUBLIC_MY_COMPANY_EMAIL;
  return (
    <Text fontWeight={"bold"} p={12}>
      No slots available. Please try a shorter meeting or contact {name}{" "}
      directly by email at{" "}
      <Link textDecoration={"underline"} href={`mailto://${email}`}>
        {email}
      </Link>
      .
    </Text>
  );
};

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
        {slots.length === 0 && <NoSlotsAvailable />}
        {slots.length > 0 && (
          <>
            <Heading as="h5" size="sm" mb={4}>
              {" "}
              Select a start time.
            </Heading>
            <Text textColor={"secondaryText"}>
              All times in {formatTimezone()} time
            </Text>
            {slots.map((slot) => (
              <CalendarSlotButton slot={slot} key={slot.start.getTime()} />
            ))}
          </>
        )}

        <BackButton />
      </VStack>
    </SlideFade>
  );
};

export default Calendar;
