import { BookingDb } from "../../../db";

import { createTRPCRouter, publicProcedure } from "../../trpc";

export const bookingsAdminRouter = createTRPCRouter({
  getAll: publicProcedure.query(async () => {
    const bookings = await BookingDb.find({ pk: "booking" });
    return bookings;
  }),
});
