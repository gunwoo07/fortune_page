import { describe, expect, it } from "vitest";
import { calculateCardLayout, wrapCardText } from "./card-layout";

const measure = (text: string) => Array.from(text).length;

describe("card text wrapping", () => {
  it("wraps Korean text and respects explicit newlines", () => {
    expect(wrapCardText("가나다라마\n바", measure, 3)).toEqual(["가나다", "라마", "바"]);
  });

  it("prefers word boundaries so the last Korean syllable is not orphaned", () => {
    expect(wrapCardText("가나다 라마 바사", measure, 5)).toEqual(["가나다", "라마 바사"]);
  });

  it("does not split a Unicode code point", () => {
    expect(wrapCardText("🍀🍀🍀", measure, 2)).toEqual(["🍀🍀", "🍀"]);
  });

  it("keeps an empty message safe to render", () => {
    expect(wrapCardText("", measure, 10)).toEqual([""]);
  });
});

describe("card image layout", () => {
  it("centers a larger illustration beneath the messages on a portrait card", () => {
    expect(calculateCardLayout(2, 1)).toMatchObject({
      titleTop: 88,
      personalTop: 155,
      commonTop: 254,
      illustrationTop: 360,
      illustrationLeft: 105,
      illustrationWidth: 190,
      illustrationHeight: 258,
      height: 800,
      footerTop: 768,
    });
  });

  it("grows the image instead of clipping long backend messages", () => {
    const layout = calculateCardLayout(30, 8);
    expect(layout.commonTop).toBeGreaterThan(155 + 29 * 27);
    expect(layout.illustrationTop).toBeGreaterThan(layout.commonTop + 7 * 26);
    expect(layout.illustrationLeft * 2 + layout.illustrationWidth).toBe(400);
    expect(layout.footerTop).toBeGreaterThan(layout.illustrationTop + layout.illustrationHeight);
    expect(layout.height).toBeGreaterThan(800);
  });
});
