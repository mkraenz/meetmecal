import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import type { Entity, OneSchema } from "dynamodb-onetable";
import { Table } from "dynamodb-onetable";
import { Dynamo } from "dynamodb-onetable/Dynamo";
import { env } from "../env/server.mjs";
import { dateToSeconds, getRandomId } from "./utils";
const client = new Dynamo({
  client: new DynamoDBClient({
    credentials: {
      accessKeyId: env.MY_AWS_USER_ACCESS_KEY_ID,
      secretAccessKey: env.MY_AWS_USER_ACCESS_KEY_SECRET,
    },
    region: env.MY_AWS_REGION,
  }),
});

const ISODateString = String; // Only for more expressive code
const ISODateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/;
export const twoWeeksInSecs = 1209600;

/**
 * @see Schema https://doc.onetable.io/api/table/schemas/attributes/
 * @see https://www.sensedeep.com/blog/posts/2021/dynamodb-onetable-tour.html
 * @see TS demo: https://github.com/sensedeep/dynamodb-onetable/blob/main/samples/typescript/src/index.ts
 * @see OneTable releases https://github.com/sensedeep/dynamodb-onetable/releases
 */
const meetMeCalOneSchema = {
  format: "onetable:1.1.0",
  version: "0.0.1",
  indexes: {
    primary: { hash: "pk", sort: "sk" },
    reversekeyindex: { hash: "sk", sort: "pk" },
    gs1: { hash: "gs1pk", sort: "gs1sk" },
    // sorting availabilities and bookings: get all availabilities (that ended) in the past, get bookings in order
  },
  models: {
    /** availabilities are immutable */
    Availability: {
      pk: { type: String, value: "availability" },
      sk: { type: String, value: "availability#${ttl}" },
      start: { type: Date, required: true },
      end: { type: Date, required: true },
      /** Equal to `end` but as number of seconds since Epoch. Using DynamoDB TTL */
      ttl: { type: Number, ttl: true, required: true },
    },
    MeetingType: {
      pk: { type: String, value: "meetingtype" },
      sk: { type: String, value: "meetingtype#${id}" },
      id: {
        type: String,
        required: true,
        encode: ["sk", "#", 1 as unknown as string],
      },
      displayName: { type: String, required: true },
      durationInMins: { type: Number, required: true },
    },
    Booking: {
      pk: { type: String, value: "booking" },
      sk: { type: String, value: "booking#${id}" },
      id: {
        type: String,
        required: true,
        generate: "ulid",
      },
      contactId: { type: String, required: true },
      contact: {
        // duplicating contact data for easy access
        type: Object,
        schema: {
          name: { type: String, required: true },
          email: { type: String },
          id: { type: String, required: true },
        },
        required: true,
      },
      meetingTypeId: { type: String, required: true },
      meetingType: {
        type: Object,
        schema: {
          durationInMinutes: { type: Number, required: true },
          displayName: { type: String, required: true },
          id: { type: String, required: true },
        },
        required: true,
      },
      start: { type: Date, required: true },
      end: { type: Date, required: true },
      confirmedByMe: { type: Boolean, default: false },
      confirmedByContact: { type: Boolean, default: false },
      gs1pk: { type: String, value: "booking#${contactId}" },
      gs1sk: { type: String, value: "booking#${id}" },
    },
    Contact: {
      pk: { type: String, value: "contact" },
      sk: { type: String, value: "contact#${id}" },
      id: {
        type: String,
        generate: "uuid",
        required: true,
        encode: ["sk", "#", 1 as unknown as string],
      },
      name: { type: String, required: true },
      email: { type: String },
      /** freetext comments and notes */
      notes: { type: String },
    },
    Token: {
      pk: { type: String, value: "token#${value}" },
      sk: { type: String, value: "token#${contactId}" },
      contactId: {
        type: String,
        required: true,
        encode: ["gs1pk", "#", 1 as unknown as string],
      },
      /**
       * identical to `exp` field. duplicated and named ttl because DynamoDB can only have one time-to-live field per table.
       * uses dynamodb TTL
       * Note: DynamoDB TTL is not immediate but can take up to 42 hours
       * @see https://aws.amazon.com/premiumsupport/knowledge-center/ttl-dynamodb/
       */
      ttl: {
        type: Number,
        ttl: true, // @see https://aws.amazon.com/premiumsupport/knowledge-center/ttl-dynamodb/
        required: true,
      },
      // Number of seconds since epoch, following JWT exp field https://www.rfc-editor.org/rfc/rfc7519#section-2 4.1.4.
      exp: {
        type: Number,
        required: true,
      },
      value: {
        type: String,
        required: true,
        encode: ["pk", "#", 1 as unknown as string],
      },
    },
  } as const,
  params: {
    isoDates: true,
    timestamps: true,
  },
} satisfies OneSchema;

export type AvailabilityEntity = Entity<
  typeof meetMeCalOneSchema.models.Availability
>;
export type MeetingTypeEntity = Entity<
  typeof meetMeCalOneSchema.models.MeetingType
>;
export type BookingEntity = Entity<typeof meetMeCalOneSchema.models.Booking>;

export const myonetable = new Table({
  client: client,
  name: env.MY_AWS_DYNAMODB_TABLE_NAME,
  schema: meetMeCalOneSchema,
  isoDates: true,
  partial: true,
});

export const AvailabilityDb = myonetable.getModel("Availability");
export const MeetingTypeDb = myonetable.getModel("MeetingType");
export const ContactDb = myonetable.getModel("Contact");
export const BookingDb = myonetable.getModel("Booking");
export const TokenDb = myonetable.getModel("Token");

// Example usage:
// const user = await UsersDb.create({
//     twitterUserId: 123
// });

/** Workaround for bug when tweet's text contains curlies https://github.com/sensedeep/dynamodb-onetable/issues/352 */
export const escapeForOneTable = (
  unescapedSetParams: Record<string, unknown>
) => {
  const substitutions: Record<string, unknown> = {};
  const setParams: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(unescapedSetParams)) {
    if (typeof value === "string" && value.match(/\${.*?}|@{.*?}|{.*?}/)) {
      const idKey = getRandomId(4);
      substitutions[idKey] = value;
      setParams[key] = `@{${idKey}}`;
    } else {
      setParams[key] = value;
    }
  }

  return { set: setParams, substitutions };
};
