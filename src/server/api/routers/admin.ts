import { AvailabilityDb, ContactDb, MeetingTypeDb, TokenDb } from "../../db";
import { getRandomId } from "../../utils";

import { createTRPCRouter, publicProcedure } from "../trpc";

export const adminRouter = createTRPCRouter({
  createExampleMeetings: publicProcedure.mutation(async () => {
    const createPromises = [
      {
        durationInMins: 15,
        displayName: "15 Min Meeting",
        id: "1547c015-5321-441a-858d-3c7eaeba6c43",
      },
      {
        durationInMins: 30,
        displayName: "30 Min Meeting",
        id: "30d0e53e-9f8d-462f-8cd9-61a1289e549f",
      },
      {
        durationInMins: 60,
        displayName: "60 Min Meeting",
        id: "603c24d5-d7eb-4f8c-bd12-369fc30805d4",
      },
      {
        durationInMins: 90,
        displayName: "90 Min Meeting",
        id: "90b33d6b-40db-49b4-af49-db112bbb1f44",
      },
    ].map((d) => MeetingTypeDb.create(d));
    await Promise.all(createPromises);
    return {
      success: true,
    };
  }),

  createExampleAvailabilities: publicProcedure.mutation(async () => {
    const createPromises = [
      {
        start: "2023-01-08T15:45:00.000Z",
        end: "2023-01-08T16:00:00.000Z",
      },
      {
        start: "2023-01-09T15:00:00.000Z",
        end: "2023-01-09T15:30:00.000Z",
      },
      {
        start: "2023-01-10T10:00:00.000Z",
        end: "2023-01-10T10:15:00.000Z",
      },
      {
        start: "2023-01-11T15:00:00.000Z",
        end: "2023-01-11T17:00:00.000Z",
      },
    ]
      .map((d) => ({
        start: new Date(d.start),
        end: new Date(d.end),
        endInSecs: Math.floor(new Date(d.end).getTime() / 1000),
      }))
      .map((d) => AvailabilityDb.create(d));
    await Promise.all(createPromises);
    return {
      success: true,
    };
  }),

  createExampleContact: publicProcedure.mutation(async () => {
    const contact = await ContactDb.create({
      name: "Test McTesting",
      email: "hello@example.com",
    });
    if (!contact.id) throw new Error("created contact has no id");
    const token = await TokenDb.create({
      contactId: contact.id,
      value: getRandomId(60),
    });
    return {
      success: true,
      token: token.value,
    };
  }),
});
