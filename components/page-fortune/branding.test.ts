import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("clover favicon assets", () => {
  it("uses only the requested two green colors and fills the drawing", () => {
    const svg = readFileSync(join(process.cwd(), "app/icon.svg"), "utf8");
    const colors = [...new Set(svg.match(/#[0-9a-f]{6}/g))].sort();
    expect(colors).toEqual(["#3a9d44", "#87d957"]);
    expect(svg).toContain('fill="#87d957"');
    expect(svg).toContain('fill="#3a9d44"');
    expect(svg).not.toContain("<text");
  });

  it("provides a real ICO fallback with four raster sizes", () => {
    const ico = readFileSync(join(process.cwd(), "app/favicon.ico"));
    expect(ico.readUInt16LE(0)).toBe(0);
    expect(ico.readUInt16LE(2)).toBe(1);
    expect(ico.readUInt16LE(4)).toBe(4);
    expect([0, 1, 2, 3].map((index) => ico[6 + index * 16])).toEqual([16, 32, 48, 64]);
  });
});
