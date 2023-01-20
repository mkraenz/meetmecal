import { BookingDb } from "../../../db";

import { createTRPCRouter, protectedProcedure } from "../../trpc";

export const bookingsAdminRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async () => {
    const bookings = await BookingDb.find({ pk: "booking" });
    return bookings;
  }),
});
