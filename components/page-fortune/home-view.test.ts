import { describe, expect, it } from "vitest";
import { getHomeView } from "./home-view";

describe("home screen selection using B's date rules", () => {
  it("passes the real Korean date and D-day to the input screen", () => {
    expect(getHomeView("2026-10-25")).toEqual({
      kind: "active",
      date: "2026-10-25",
      dday: 25,
    });
  });

  it("shows the start notice before the campaign", () => {
    expect(getHomeView("2026-09-18")).toEqual({ kind: "not-started" });
  });

  it("keeps the exam day open", () => {
    expect(getHomeView("2026-11-19")).toEqual({
      kind: "active",
      date: "2026-11-19",
      dday: 0,
    });
  });

  it("shows the closure notice from the following day", () => {
    expect(getHomeView("2026-11-20")).toEqual({ kind: "closed" });
  });

  it("does not render a form for an invalid date", () => {
    expect(getHomeView("2026-02-30")).toEqual({ kind: "invalid" });
  });
});
