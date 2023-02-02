import { DateTime, Interval } from "luxon";
import type { AvailabilityEntity, BookingEntity } from "../server/db";

export const getAvailabilitiesMinusBookings = (
  availabilityEntities: AvailabilityEntity[],
  bookingsEntities: BookingEntity[],
  noMeetingsWithinNextNMins = 60,
  roundToNearestMins = 15
) => {
  const noMeetingsBefore = DateTime.now()
    .plus({
      minutes: noMeetingsWithinNextNMins,
    })
    .startOf("minute");
  const remainderToNextNearestMins =
    DateTime.now().minute % roundToNearestMins === 0
      ? 0
      : roundToNearestMins - (DateTime.now().minute % roundToNearestMins);
  const roundedNoMeetingsBefore = noMeetingsBefore.plus({
    minutes: remainderToNextNearestMins,
  });
  const futureAvs = availabilityEntities
    .map((a) =>
      Interval.fromISO(`${a.start.toISOString()}/${a.end.toISOString()}`)
    )
    .map((a) =>
      a.start < noMeetingsBefore
        ? Interval.fromDateTimes(roundedNoMeetingsBefore, a.end) // meetings shouldn't start within, e.g., the next hour (because I do not check my mails that often)
        : a
    )
    .filter((a) => a.isValid && a.end > DateTime.now());

  // merge overlapping or adjacent intervals
  const maxAvs = Interval.merge(futureAvs);
  const futureBookings = bookingsEntities
    .map((b) =>
      Interval.fromISO(`${b.start.toISOString()}/${b.end.toISOString()}`)
    )
    .filter((b) => b.end > DateTime.now());
  const x = maxAvs.reduce<Interval[]>((newAvs, av) => {
    return [...newAvs, ...av.difference(...futureBookings)];
  }, []);
  return x;
};
