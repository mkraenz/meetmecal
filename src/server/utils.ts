import { randomBytes } from "crypto";

export const getRandomId = (length: number) =>
  randomBytes(length * 6) // base64url encoding is 6 bits per character
    .toString("base64url")
    .replace("-", "")
    .replace("_", "")
    .substring(0, length);

export const isValidDate = (date: Date) =>
  date instanceof Date && !isNaN(date.getTime());
export const isValidDateString = (dateString: string) =>
  new Date(dateString) instanceof Date &&
  !isNaN(new Date(dateString).getTime());
export const isInPast = (date: Date | string) =>
  date instanceof Date ? date < new Date() : new Date(date) < new Date();

export const dateToSeconds = (date: Date | string) =>
  Math.floor(new Date(date).getTime() / 1000);
