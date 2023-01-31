import { DateTime, Interval } from "luxon";
import type { AvailabilityEntity, BookingEntity } from "../server/db";

export const getAvailabilitiesMinusBookings = (
  availabilityEntities: AvailabilityEntity[],
  bookingsEntities: BookingEntity[],
  noMeetingsBefore: DateTime,
  roundToNearestMins = 15
) => {
  const remainderToNextNearestMins =
    DateTime.now().minute % roundToNearestMins === 0
      ? 0
      : roundToNearestMins - (DateTime.now().minute % roundToNearestMins);
  const _noMeetingsBefore = noMeetingsBefore.plus({
    minutes: remainderToNextNearestMins,
  });
  const futureAvs = availabilityEntities
    .map((a) =>
      Interval.fromISO(`${a.start.toISOString()}/${a.end.toISOString()}`)
    )
    .map((a) =>
      a.start < noMeetingsBefore
        ? Interval.fromDateTimes(_noMeetingsBefore, a.end) // meetings shouldn't start within, e.g., the next hour (because I do not check my mails that often)
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
