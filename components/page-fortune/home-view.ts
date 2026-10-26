import { validateFortuneDate } from "../../lib/fortune-api";
import { calculateDday } from "../../lib/date";

export type HomeView =
  | { kind: "active"; date: string; dday: number }
  | { kind: "not-started" | "closed" | "invalid" };

/**
 * B owns date validation and D-day calculation.
 * This adapter only maps those existing rules to A's screen names.
 */
export function getHomeView(today: string): HomeView {
  const error = validateFortuneDate(today, today);

  if (error === "before-campaign") return { kind: "not-started" };
  if (error === "campaign-ended") return { kind: "closed" };
  if (error) return { kind: "invalid" };

  return { kind: "active", date: today, dday: calculateDday(today) };
}
