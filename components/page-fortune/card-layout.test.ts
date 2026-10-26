import { describe, expect, it } from "vitest";
import { calculateCardLayout, wrapCardText } from "./card-layout";

const measure = (text: string) => Array.from(text).length;

describe("card text wrapping", () => {
  it("wraps Korean text and respects explicit newlines", () => {
    expect(wrapCardText("가나다라마\n바", measure, 3)).toEqual(["가나다", "라마", "바"]);
  });

  it("does not split a Unicode code point", () => {
    expect(wrapCardText("🍀🍀🍀", measure, 2)).toEqual(["🍀🍀", "🍀"]);
  });

  it("keeps an empty message safe to render", () => {
    expect(wrapCardText("", measure, 10)).toEqual([""]);
  });
});

describe("card image layout", () => {
  it("preserves the short-message sketch proportions", () => {
    expect(calculateCardLayout(2, 1)).toMatchObject({
      commonTop: 460,
      illustrationTop: 535,
      height: 800,
      footerTop: 775,
    });
  });

  it("grows the image instead of clipping long backend messages", () => {
    const layout = calculateCardLayout(30, 8);
    expect(layout.commonTop).toBeGreaterThan(285 + 29 * 28);
    expect(layout.illustrationTop).toBeGreaterThan(layout.commonTop + 7 * 26);
    expect(layout.footerTop).toBeGreaterThan(layout.illustrationTop + 190);
    expect(layout.height).toBeGreaterThan(800);
  });
});
