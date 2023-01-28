import { MeetingTypeDb } from "../../db";

import { createTRPCRouter, protectedProcedure } from "../trpc";

export const adminRouter = createTRPCRouter({
  createExampleMeetings: protectedProcedure.mutation(async () => {
    const alreadySeeded = await MeetingTypeDb.get({
      id: "1547c015-5321-441a-858d-3c7eaeba6c43",
    });
    if (alreadySeeded) return { error: 400, message: "Already seeded" };

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
});
