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
        endInSecs: dateToSeconds(end),
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
});
