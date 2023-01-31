import { z } from "zod";
import { truncateDateByMinute } from "../../../../utils/date.utils";
import { AvailabilityDb, myonetable } from "../../../db";
import { dateToSeconds } from "../../../utils";

import { createTRPCRouter, protectedProcedure } from "../../trpc";

export const availabilitiesAdminRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        start: z.string().datetime().transform(truncateDateByMinute),
        end: z.string().datetime().transform(truncateDateByMinute),
      })
    )
    .mutation(async ({ input }) => {
      const end = input.end;
      const availability = await AvailabilityDb.create({
        start: input.start,
        end,
        ttl: dateToSeconds(end),
      });

      return {
        availability,
      };
    }),
  move: protectedProcedure
    .input(
      z.object({
        start: z.string().datetime().transform(truncateDateByMinute),
        end: z.string().datetime().transform(truncateDateByMinute),
        /** used as identifier of the availability */
        oldEnd: z.string().datetime(),
      })
    )
    .mutation(async ({ input }) => {
      const end = input.end;
      const transaction = {};
      await AvailabilityDb.create(
        {
          start: input.start,
          end,
          ttl: dateToSeconds(end),
        },
        { transaction }
      );

      const endInSecs = dateToSeconds(input.oldEnd);
      await AvailabilityDb.remove(
        {
          pk: "availability",
          sk: `availability#${endInSecs}`,
        },
        {
          exists: true, // remove will throw if value does not exist
          transaction,
        }
      );
      await myonetable.transact("write", transaction);

      return { success: true };
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
  merge: protectedProcedure
    .input(
      z
        .object({
          start: z.string().datetime().transform(truncateDateByMinute),
          end: z.string().datetime().transform(truncateDateByMinute),
          overlaps: z.array(
            z
              .object({
                start: z.string().datetime(),
                end: z.string().datetime(),
              })
              .refine((val) => val.start < val.end)
          ),
        })
        .refine((val) => val.start < val.end, {
          message: "start must be before end",
        })
    )
    .mutation(async ({ input }) => {
      const { start, end, overlaps } = input;
      const transaction = {};
      for (const av of overlaps) {
        const endInSecs = dateToSeconds(av.end);
        await AvailabilityDb.remove(
          {
            pk: "availability",
            sk: `availability#${endInSecs}`,
          },
          {
            exists: true, // remove will throw if value does not exist
            transaction,
          }
        );
      }
      await myonetable.transact("write", transaction);
      // WORKAROUND: would be great if we could do this in a single transaction but because the new end time might collide with an existing availability, and we use end time as sort key, we can't do this in a single transaction
      await AvailabilityDb.create({
        start,
        end,
        ttl: dateToSeconds(end),
      });
      return { success: true };
    }),
});
