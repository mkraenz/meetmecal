import {
  Button,
  Skeleton,
  Stack,
  useDisclosure,
  useToken,
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
import { Interval } from "luxon";
import { type NextPage } from "next";
import Head from "next/head";
import { useRef, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import AdminLoadingIndicator from "../../components/admin/AdminLoadingIndicator";
import EventPopper from "../../components/admin/calendar/EventPopper";
import useAdminSession from "../../components/admin/useAdminSession";
import { api } from "../../utils/api";

interface Props {}

const availabilityEventPrefix = "availabilityEvent#" as const;
const bookingEventPrefix = "bookingEvent#" as const;

const CalendarAdmin: NextPage<Props> = (props) => {
  const session = useAdminSession();
  const popperControl = useDisclosure({ defaultIsOpen: false });
  const [popperPos, setPopperPos] = useState({ left: -1000, top: 0 });
  const [selectedEvent, setSelectedEvent] = useState<EventImpl | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [bookingsBgColor] = useToken("colors", ["red.400"]);
  const availabilities = api.availabilitiesAdmin.getAll.useQuery();
  const bookings = api.bookingsAdmin.getAll.useQuery();
  const removeAvailability = api.availabilitiesAdmin.remove.useMutation();
  const createMeetingTypes = api.admin.createExampleMeetings.useMutation();

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
  const mergeAvailability = api.availabilitiesAdmin.merge.useMutation();

  const availabilityEvents: EventInput[] =
    availabilities.data?.map((availability) => ({
      id: `${availabilityEventPrefix}${availability.end}`,
      title: "Available",
      start: availability.start,
      end: availability.end,
    })) || [];
  const bookingEvents = bookings.data?.map((booking) => ({
    id: `${bookingEventPrefix}${booking.id}`,
    title: `${booking.meetingType.displayName} @${booking.contact.name}`,
    start: booking.start,
    end: booking.end,
  }));

  if (session.status === "loading") return <AdminLoadingIndicator />;

  const handleEventMoveOrResize = ({
    event,
    oldEvent,
  }: EventResizeDoneArg | EventDropArg) => {
    const eventEnd = event.end;
    if (event.start && eventEnd && oldEvent.end && oldEvent.start) {
      const overlaps = availabilities.data
        ?.map((a) => Interval.fromISO(`${a.start}/${a.end}`))
        .filter((interval) =>
          interval.overlaps(
            Interval.fromISO(
              `${event.start?.toISOString()}/${eventEnd.toISOString()}`
            )
          )
        );
      if (overlaps && overlaps.length > 0) {
        const confirmed = confirm(
          "Warning: Selected interval overlaps other availabilities. Would you like to merge them into one? If not, please select a different start or end time."
        );
        if (confirmed) {
          const mergedIntervals = Interval.merge([
            ...overlaps,
            Interval.fromISO(
              `${event.start.toISOString()}/${eventEnd.toISOString()}`
            ),
          ]);
          if (mergedIntervals.length !== 1)
            return alert("This is definitely a bug. Please contact us.");
          mergeAvailability.mutate(
            {
              // for whatever reason, zod does not like Luxon's toISO()
              start: mergedIntervals[0].start.toJSDate().toISOString(),
              end: mergedIntervals[0].end.toJSDate().toISOString(),
              overlaps: overlaps.map((a) => ({
                start: a.start.toJSDate().toISOString(),
                end: a.end.toJSDate().toISOString(),
              })),
            },
            {
              onSuccess: () => availabilities.refetch(),
              onError: () =>
                alert("This didn't work as expected. Please try again."),
            }
          );
          return;
        }
      }
      moveAvailability.mutate(
        {
          start: event.start.toISOString(),
          end: eventEnd.toISOString(),
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
    const confirmed = confirm(
      `Would you like to add an availability from ${start} to ${end}?`
    );
    if (confirmed) {
      // so much duplication, but good enough for now... Refactor in case I touch this again
      const overlaps = availabilities.data
        ?.map((a) => Interval.fromISO(`${a.start}/${a.end}`))
        .filter((interval) =>
          interval.overlaps(
            Interval.fromISO(`${start.toISOString()}/${end.toISOString()}`)
          )
        );
      if (overlaps && overlaps.length > 0) {
        const mergeConfirmed = confirm(
          "Warning: Selected interval overlaps other availabilities. Would you like to merge them into one? If not, please select a different start or end time."
        );
        if (!mergeConfirmed) {
          return alert(
            "Please select a different start or end time, or allow merging."
          );
        }
        const mergedIntervals = Interval.merge([
          ...overlaps,
          Interval.fromISO(`${start.toISOString()}/${end.toISOString()}`),
        ]);
        if (mergedIntervals.length !== 1)
          return alert("My bad, the logic is wrong. Please contact us.");
        mergeAvailability.mutate(
          {
            // for whatever reason, zod does not like Luxon's toISO()
            start: mergedIntervals[0].start.toJSDate().toISOString(),
            end: mergedIntervals[0].end.toJSDate().toISOString(),
            overlaps: overlaps.map((a) => ({
              start: a.start.toJSDate().toISOString(),
              end: a.end.toJSDate().toISOString(),
            })),
          },
          {
            onSuccess: () => availabilities.refetch(),
            onError: () =>
              alert("This didn't work as expected. Please try again."),
          }
        );
        return;
      }

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
  const handleEventClick = ({ event, jsEvent, ...rest }: EventClickArg) => {
    jsEvent.preventDefault();
    setPopperPos({
      left: jsEvent.pageX,
      top: jsEvent.pageY,
    });
    setSelectedEvent(event);
    buttonRef.current?.click();
  };

  return (
    <AdminLayout>
      <Head>
        <title>Admin MeetMeCal - Availabilities</title>
      </Head>
      <Stack
        as="main"
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
            // hiddenDays={[0, 6]} // hide weekends
            slotMinTime={"09:00:00"} // only show business hours
            slotMaxTime={"20:00:00"}
            slotDuration={"00:15:00"}
            validRange={{
              start: new Date(), // only future dates are shown
            }}
            eventSources={[
              { events: availabilityEvents },
              {
                events: bookingEvents,
                color: bookingsBgColor,
                durationEditable: false,
                editable: false,
              },
            ]}
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

        <EventPopper
          buttonRef={buttonRef}
          eventType={
            selectedEvent?.id.startsWith(availabilityEventPrefix)
              ? "availability"
              : "booking"
          }
          isOpen={popperControl.isOpen}
          onClose={popperControl.onClose}
          onAvailabilityEventDelete={deleteAvailability}
          onOpen={popperControl.onOpen}
          popperPos={popperPos}
          availabilityDeleteIsLoading={removeAvailability.isLoading}
        />
      </Stack>
      <Button
        onClick={() => createMeetingTypes.mutate()}
        isLoading={createMeetingTypes.isLoading}
      >
        Seed Meeting Types
      </Button>
    </AdminLayout>
  );
};

export default CalendarAdmin;
