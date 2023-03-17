import { z } from "zod";
import { ContactDb, TokenDb, twoWeeksInSecs } from "../../../db";
import { dateToSeconds, getRandomId } from "../../../utils";

import { createTRPCRouter, protectedProcedure } from "../../trpc";

const createValidator = z.object({
  name: z.string().min(4),
  email: z.string().optional(),
  notes: z.string().optional(),
});

const Logger =
  ({
    correlationId,
    contactId,
  }: {
    correlationId: string;
    contactId: string;
  }) =>
  (obj: Record<string, unknown>) =>
    console.log(JSON.stringify({ ...obj, correlationId, contactId }));

export const contactsAdminRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async () => {
    const contacts = await ContactDb.find({ pk: "contact" });
    return contacts;
  }),
  /** creates a contact and a corresponding accesstoken */
  create: protectedProcedure
    .input(createValidator)
    .mutation(async ({ input }) => {
      const contact = await ContactDb.create({
        name: input.name,
        email: input.email,
      });
      const exp = dateToSeconds(new Date()) + twoWeeksInSecs;
      const token = await TokenDb.create({
        contactId: contact.id,
        value: getRandomId(60),
        exp,
        ttl: exp,
      });
      return { contact, token };
    }),
  remove: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input }) => {
      const contactId = input.id;

      const correlationId = getRandomId(10);
      const log = Logger({ correlationId, contactId });
      log({ msg: "deletion request for contact" });
      log({ msg: "deleting tokens of contact" });
      const tokens = await TokenDb.find(
        { sk: `token#${contactId}` },
        { index: "reversekeyindex" }
      );

      log({ msg: "found tokens. Starting deletion...", count: tokens.length });
      const removePromises = tokens.map((t) => {
        // no batching for now since there is typically only one token per contact
        return TokenDb.remove({
          pk: `token#${t.value}`,
          sk: `token#${contactId}`,
        });
      });
      await Promise.all(removePromises);
      log({ msg: "deleted tokens" });

      log({ msg: "deleting contact..." });
      await ContactDb.remove(
        {
          pk: "contact",
          sk: `contact#${contactId}`,
        },
        { exists: true }
      );
      log({ msg: "contact deletion completed" });
      return { success: true };
    }),
});
