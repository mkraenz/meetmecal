import { adminRouter } from "./routers/admin";
import { availabilitiesAdminRouter } from "./routers/admin/availabilities";
import { bookingsAdminRouter } from "./routers/admin/bookings";
import { contactsAdminRouter } from "./routers/admin/contacts";
import { bookingRouter } from "./routers/bookings";
import { createTRPCRouter } from "./trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here
 */
export const appRouter = createTRPCRouter({
  bookings: bookingRouter,
  admin: adminRouter,
  availabilitiesAdmin: availabilitiesAdminRouter,
  bookingsAdmin: bookingsAdminRouter,
  contactsAdmin: contactsAdminRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
