import { z } from "zod";
import { ContactDb, TokenDb } from "../../../db";
import { getRandomId } from "../../../utils";

import { createTRPCRouter, publicProcedure } from "../../trpc";

const createValidator = z.object({
  name: z.string().min(4),
  email: z.string().optional(),
  notes: z.string().optional(),
});

export const contactsAdminRouter = createTRPCRouter({
  getAll: publicProcedure.query(async () => {
    const contacts = await ContactDb.find({ pk: "contact" });
    return contacts;
  }),
  /** creates a contact and a corresponding accesstoken */
  create: publicProcedure.input(createValidator).mutation(async ({ input }) => {
    const contact = await ContactDb.create({
      name: input.name,
      email: input.email,
    });
    const token = await TokenDb.create({
      contactId: contact.id,
      value: getRandomId(60),
    });
    return { contact, token };
  }),
  remove: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input }) => {
      const contactId = input.id;
      console.log(`deletion request for contact. id: ${contactId}`);
      console.log(`contact deleted. id: ${contactId}`);
      console.log(`deleting tokens of contact. contactId: ${contactId}`);
      const tokens = await TokenDb.find(
        { sk: `token#${contactId}` },
        { index: "reversekeyindex" }
      );

      console.log("found tokens. Starting deletion... . count:", tokens.length);
      const removePromises = tokens.map((t) => {
        // no batching for now since there is typically only one token per contact
        return TokenDb.remove({
          pk: `token#${t.value}`,
          sk: `token#${contactId}`,
        });
      });
      await Promise.all(removePromises);
      console.log(`deleted tokens of contact. contactId: ${contactId}`);

      console.log(`deleting contact. id: ${contactId}`);
      await ContactDb.remove(
        {
          pk: "contact",
          sk: `contact#${contactId}`,
        },
        { exists: true }
      );
      console.log(`contact deleted. id: ${contactId}`);
      return { success: true };
    }),
});
