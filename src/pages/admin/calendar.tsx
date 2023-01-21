import {
  Button,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
  Skeleton,
  Stack,
  useDisclosure,
} from "@chakra-ui/react";
import type {
  DateSelectArg,
  EventClickArg,
  EventDropArg,
  EventInput,
} from "@fullcalendar/core";
import type { EventImpl } from "@fullcalendar/core/internal";
import type { EventResizeDoneArg } from "@fullcalendar/interaction";
import interactionPlugin from "@fullcalendar/interaction";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import { type NextPage } from "next";
import Head from "next/head";
import { useRef, useState } from "react";
import AdminLoadingIndicator from "../../components/admin/AdminLoadingIndicator";
import useAdminSession from "../../components/admin/useAdminSession";
import { api } from "../../utils/api";

interface Props {}

const CalendarAdmin: NextPage<Props> = (props) => {
  const session = useAdminSession();
  const popperControl = useDisclosure({ defaultIsOpen: false });
  const [popperPos, setPopperPos] = useState({ left: -1000, top: 0 });
  const [selectedEvent, setSelectedEvent] = useState<EventImpl | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const availabilities = api.availabilitiesAdmin.getAll.useQuery();
  const removeAvailability = api.availabilitiesAdmin.remove.useMutation();

  const deleteAvailability = () => {
    const end = selectedEvent?.end;
    if (!end) return alert("This didn't work as expected. Please try again.");
    removeAvailability.mutate(
      { end: end.toISOString() },
      {
        onSuccess: () => {
          availabilities.refetch();
          popperControl.onClose();
        },
        onError: () => alert("This didn't work as expected. Please try again."),
      }
    );
  };
  const createAvailability = api.availabilitiesAdmin.create.useMutation();
  const moveAvailability = api.availabilitiesAdmin.move.useMutation();

  const events: EventInput[] =
    availabilities.data?.map((availability) => ({
      id: availability.end,
      title: "Available",
      start: availability.start,
      end: availability.end,
    })) || [];

  if (session.status === "loading") return <AdminLoadingIndicator />;

  const handleEventMoveOrResize = ({
    event,
    oldEvent,
  }: EventResizeDoneArg | EventDropArg) => {
    if (event.start && event.end && oldEvent.end) {
      moveAvailability.mutate(
        {
          start: event.start.toISOString(),
          end: event.end.toISOString(),
          oldEnd: oldEvent.end.toISOString(),
        },
        {
          onSuccess: () => availabilities.refetch(),
          onError: () =>
            alert("This didn't work as expected. Please try again."),
        }
      );
    }
  };
  const handleSelect = ({ start, end }: DateSelectArg) => {
    // TODO handle overlapping availabilities (also for move and resize...?) Or maybe handle on backend? Or only on bookers' frontend?
    const confirmed = confirm(
      `Would you like to add an availability from ${start} to ${end}?`
    );
    if (confirmed) {
      createAvailability.mutate(
        {
          start: start.toISOString(),
          end: end.toISOString(),
        },
        {
          onSuccess: () => availabilities.refetch(),
          onError: () =>
            alert("This didn't work as expected. Please try again."),
        }
      );
    }
  };
  const handleEventClick = ({ event, jsEvent }: EventClickArg) => {
    jsEvent.preventDefault();
    setPopperPos({
      left: jsEvent.pageX,
      top: jsEvent.pageY,
    });
    setSelectedEvent(event);
    buttonRef.current?.click();
  };

  return (
    <>
      <Head>
        <title>Admin MeetMeCal - Availabilities</title>
      </Head>
      <Stack
        as="main"
        pt={4}
        gap={4}
        minW={"md"}
        maxW={{ lg: "1100px" }}
        m={{ lg: "40px auto" }}
      >
        <Skeleton isLoaded={!availabilities.isLoading}>
          {/* see https://fullcalendar.io/docs/date-clicking-selecting, 
          ,  */}
          <FullCalendar
            plugins={[interactionPlugin, timeGridPlugin]}
            initialView={"timeGridWeek"}
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "",
            }}
            eventClick={handleEventClick}
            hiddenDays={[0, 6]} // hide weekends
            slotMinTime={"09:00:00"} // only show business hours
            slotMaxTime={"20:00:00"}
            slotDuration={"00:15:00"}
            validRange={{
              start: new Date(), // only future dates are shown
            }}
            events={events}
            selectable // https://fullcalendar.io/docs/selectable
            editable // https://fullcalendar.io/docs/editable
            eventDrop={handleEventMoveOrResize}
            eventResize={handleEventMoveOrResize}
            dragScroll
            selectAllow={(selectInfo) =>
              selectInfo.start.getDate() === selectInfo.end.getDate()
            } // only allow selection within one day
            select={handleSelect}
          />
        </Skeleton>

        <Popover placement="top-start" isOpen={popperControl.isOpen}>
          <PopoverTrigger>
            {/* dirty WORKAROUND: we need some PopoverTrigger as anchor. So we just set this invisible button to the click position, and then programmatically click the button. */}
            <Button
              onClick={popperControl.onOpen}
              ref={buttonRef}
              position={"absolute"}
              top={popperPos.top}
              left={popperPos.left}
              visibility="hidden"
            ></Button>
          </PopoverTrigger>
          <PopoverContent>
            <PopoverHeader fontWeight="semibold" textColor={"alternateText"}>
              Delete availability?
            </PopoverHeader>
            <PopoverArrow />
            <PopoverCloseButton onClick={popperControl.onClose} />
            <PopoverBody>
              <Button
                onClick={deleteAvailability}
                isLoading={removeAvailability.isLoading}
                bgColor="brand.500"
              >
                Delete
              </Button>
            </PopoverBody>
          </PopoverContent>
        </Popover>
      </Stack>
    </>
  );
};

export default CalendarAdmin;
