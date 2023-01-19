import type { Slot } from "../state/app.context";

export const formatDate = (slot: Slot) => {
  return new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(slot.start);
};

export const formatDateOnly = (date: Date | string) => {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "full",
  }).format(toDate(date));
};

export const formatTime = (date: Date | string) => {
  return new Intl.DateTimeFormat(undefined, {
    timeStyle: "short",
  }).format(toDate(date));
};

export const formatTimezone = () => {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
};

const toDate = (date: Date | string) => new Date(date);
