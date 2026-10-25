import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  redirect: (path: string) => { throw new Error(`redirect:${path}`); },
}));

import { submitDigit } from "./home-actions";

afterEach(() => vi.useRealTimers());

describe("home submission", () => {
  it("uses the server's Korean date for the canonical result path", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-25T03:00:00Z"));
    await expect(submitDigit(0)).rejects.toThrow("redirect:/r/2026-10-25/0");
  });

  it("uses the new Korean date after midnight, not the date of an old form", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-25T15:00:00Z"));
    await expect(submitDigit(8)).rejects.toThrow("redirect:/r/2026-10-26/8");
  });

  it("returns to the home status screen when the campaign is over", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-19T15:00:00Z"));
    await expect(submitDigit(8)).rejects.toThrow(/^redirect:\/$/);
  });

  it("returns to the start notice before the campaign", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-18T03:00:00Z"));
    await expect(submitDigit(8)).rejects.toThrow(/^redirect:\/$/);
  });

  it.each([-1, 10, 1.5, NaN, "8", null])("rejects tampered action input %j", async (digit) => {
    await expect(submitDigit(digit as number)).rejects.toThrow(/^redirect:\/$/);
  });
});
