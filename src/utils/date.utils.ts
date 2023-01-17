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

export const formatDateOnly = (date: Date) => {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "full",
  }).format(date);
};

export const formatTime = (date: Date) => {
  return new Intl.DateTimeFormat(undefined, {
    timeStyle: "short",
  }).format(date);
};

export const formatTimezone = () => {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
};
