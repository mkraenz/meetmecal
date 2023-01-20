import { z } from "zod";
import { AvailabilityDb } from "../../../db";
import { dateToSeconds } from "../../../utils";

import { createTRPCRouter, protectedProcedure } from "../../trpc";

const createValidator = z.object({
  start: z.string().datetime(),
  end: z.string().datetime(),
});

export const availabilitiesAdminRouter = createTRPCRouter({
  create: protectedProcedure
    .input(createValidator)
    .mutation(async ({ input }) => {
      const end = new Date(input.end);
      const availability = await AvailabilityDb.create({
        start: new Date(input.start),
        end,
        ttl: dateToSeconds(end),
      });

      return {
        availability,
      };
    }),
  getAll: protectedProcedure.query(async () => {
    const availabilities = await AvailabilityDb.find({ pk: "availability" });
    return availabilities.map((av) => ({
      start: av.start.toISOString(),
      end: av.end.toISOString(),
    }));
  }),
  remove: protectedProcedure
    .input(z.object({ end: z.string() }))
    .mutation(async ({ input }) => {
      const { end } = input;
      const endInSecs = dateToSeconds(end);
      await AvailabilityDb.remove(
        {
          pk: "availability",
          sk: `availability#${endInSecs}`,
        },
        {
          exists: true, // remove will throw if value does not exist
        }
      );
      return { success: true };
    }),
});
