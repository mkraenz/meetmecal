import { DateTime, Interval } from "luxon";
import type { AvailabilityEntity, BookingEntity } from "../server/db";

export const getAvailabilitiesMinusBookings = (
  availabilityEntities: AvailabilityEntity[],
  bookingsEntities: BookingEntity[]
) => {
  const futureAvs = availabilityEntities
    .map((a) =>
      Interval.fromISO(`${a.start.toISOString()}/${a.end.toISOString()}`)
    )
    .filter((a) => a.end > DateTime.now());
  const futureBookings = bookingsEntities
    .map((b) =>
      Interval.fromISO(`${b.start.toISOString()}/${b.end.toISOString()}`)
    )
    .filter((b) => b.end > DateTime.now());
  const x = futureAvs.reduce<Interval[]>((newAvs, av) => {
    return [...newAvs, ...av.difference(...futureBookings)];
  }, []);
  return x;
};
