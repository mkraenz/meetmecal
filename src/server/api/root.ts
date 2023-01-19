import { adminRouter } from "./routers/admin";
import { availabilitiesAdminRouter } from "./routers/admin/availabilities";
import { bookingsAdminRouter } from "./routers/admin/bookings";
import { bookingRouter } from "./routers/bookings";
import { exampleRouter } from "./routers/example";
import { createTRPCRouter } from "./trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here
 */
export const appRouter = createTRPCRouter({
  example: exampleRouter,
  bookings: bookingRouter,
  admin: adminRouter,
  availabilitiesAdmin: availabilitiesAdminRouter,
  bookingsAdmin: bookingsAdminRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
