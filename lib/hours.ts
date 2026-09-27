import type { OpeningHours } from "@/lib/db/schema";

export type HoursGroup = { from: number; to: number; opens: string; closes: string } | { from: number; to: number; closed: true };

export function groupOpeningHours(hours: OpeningHours | null) {
  if (!hours?.length) return [];
  const groups: HoursGroup[] = [];
  hours.forEach((day, index) => {
    const last = groups.at(-1);
    const same =
      last &&
      last.to === index - 1 &&
      (day == null ? "closed" in last : !("closed" in last) && last.opens === day.opens && last.closes === day.closes);
    if (same) last.to = index;
    else groups.push(day ? { from: index, to: index, opens: day.opens, closes: day.closes } : { from: index, to: index, closed: true });
  });
  return groups;
}

export function dayRange(group: HoursGroup, days: string[], short = true) {
  const name = (i: number) => (short ? days[i].slice(0, 3) : days[i]);
  return group.from === group.to ? name(group.from) : `${name(group.from)} – ${name(group.to)}`;
}

const schemaDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export function openingHoursSpecification(hours: OpeningHours | null) {
  return (hours ?? []).flatMap((day, index) =>
    day ? [{ "@type": "OpeningHoursSpecification", dayOfWeek: schemaDays[index], opens: day.opens, closes: day.closes }] : [],
  );
}
