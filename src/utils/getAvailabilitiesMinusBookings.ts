import { DateTime, Interval } from "luxon";
import type { AvailabilityEntity, BookingEntity } from "../server/db";
import { last } from "./mymath";

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

  // merge availabilities that overlap
  // 'maximal availabilitiy' in the sense that no two availabilities overlap or are adjacent
  const maxAvs = futureAvs
    .sort((a, b) => a.start.toMillis() - b.start.toMillis()) // earliest first
    .reduce<Interval[]>((mergedAvs, next) => {
      if (mergedAvs.length === 0) return [next];
      // avs are valid (end > start) and
      // sorted by start time (earliest first).
      // Thus we just need to check for overlap on consecutive avs.
      const previous = last(mergedAvs);
      if (previous.overlaps(next)) {
        return [...mergedAvs.slice(0, -1), previous.union(next)];
      }
      return [...mergedAvs, next];
    }, []);
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
