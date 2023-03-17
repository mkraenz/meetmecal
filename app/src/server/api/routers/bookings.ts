import { DateTime, Interval } from "luxon";
import { z } from "zod";
import { getAvailabilitiesMinusBookings } from "../../../utils/getAvailabilitiesMinusBookings";
import {
  AvailabilityDb,
  BookingDb,
  ContactDb,
  MeetingTypeDb,
  TokenDb,
} from "../../db";
import { getRandomId } from "../../utils";

import { createTRPCRouter, publicProcedure } from "../trpc";

const bookValidator = z.object({
  name: z.string().min(4),
  email: z.string().email(),
  token: z.string().min(50),
  /** start time of the slot */
  slot: z.string().datetime(),
  meetingTypeId: z.string().uuid(),
});

export const bookingRouter = createTRPCRouter({
  book: publicProcedure.input(bookValidator).mutation(async ({ input }) => {
    const accessToken = await TokenDb.get({ value: input.token });
    if (!accessToken)
      return { error: 401, message: "Invalid or expired token" };
    const tokenIsValid = new Date(accessToken.exp * 1000) < new Date();
    if (tokenIsValid)
      return { error: 401, message: "Invalid or expired token" };

    const correlationId = getRandomId(10);
    console.log("booking...", { correlationId });
    const contact = await ContactDb.get({ id: accessToken.contactId });
    const meetingType = await MeetingTypeDb.get({ id: input.meetingTypeId });
    if (!meetingType || !contact) return { error: 404 };
    const endInSecs =
      (Math.floor(new Date(input.slot).getTime() / 1000 / 60) +
        meetingType.durationInMins) *
      60;

    // making sure the slot is available
    const slot = Interval.fromDateTimes(
      DateTime.fromISO(input.slot),
      DateTime.fromSeconds(endInSecs)
    );

    const rawAvailabilities = await AvailabilityDb.find({ pk: "availability" });
    const existingBookings = await BookingDb.find({ pk: "booking" });
    const availabilities = getAvailabilitiesMinusBookings(
      rawAvailabilities,
      existingBookings
    );
    const slotIsInavailable = availabilities.every((a) => !slot.overlaps(a));
    if (slotIsInavailable) {
      console.warn(
        "inavailable slot being booked. This shouldn't happen with normal app usage (unless we have a bug e.g. in calculating actual availabilities)",
        {
          correlationId,
          slot: input.slot,
          endInSecs,
          meetingTypeDuration: meetingType.durationInMins,
        }
      );
      return {
        error: 409,
        message:
          "Slot is not available for the given duration. Please choose a different slot and/or duration.",
      };
    }

    const booking = await BookingDb.create({
      contactId: contact.id,
      start: new Date(input.slot),
      end: new Date(endInSecs * 1000),
      meetingTypeId: meetingType.id,
      meetingType: {
        displayName: meetingType.displayName,
        durationInMinutes: meetingType.durationInMins,
        id: meetingType.id,
      },
      contact: {
        id: contact.id,
        name: input.name,
        email: input.email,
      },
    });
    await ContactDb.update({
      id: contact.id,
      name: input.name,
      email: input.email,
    });
    // NOTE: we send emails via DynamoDB Streams. Every month first 2.5mio stream read units are free

    console.log("booking completed", { correlationId });
    return {
      booking,
    };
  }),
});
