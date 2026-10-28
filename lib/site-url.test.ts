import { describe, expect, it } from "vitest";
import { getSiteUrl } from "./site-url";

describe("site URL configuration", () => {
  it("uses localhost during development when no public URL is configured", () => {
    expect(getSiteUrl({ NODE_ENV: "development" }).href).toBe(
      "http://localhost:3000/",
    );
  });

  it("prefers the explicitly configured public origin", () => {
    expect(
      getSiteUrl({
        NODE_ENV: "production",
        SITE_URL: "https://fortune.example.com/some/path",
        VERCEL_URL: "preview.vercel.app",
      }).href,
    ).toBe("https://fortune.example.com/");
  });

  it("uses Vercel's production domain when SITE_URL is not configured", () => {
    expect(
      getSiteUrl({
        NODE_ENV: "production",
        VERCEL_PROJECT_PRODUCTION_URL: "fortune.vercel.app",
      }).href,
    ).toBe("https://fortune.vercel.app/");
  });

  it("uses the selected Vercel domain as the production fallback", () => {
    expect(getSiteUrl({ NODE_ENV: "production" }).href).toBe(
      "https://fortune-page-alpha.vercel.app/",
    );
  });

  it("rejects non-http public origins", () => {
    expect(() =>
      getSiteUrl({ NODE_ENV: "production", SITE_URL: "ftp://fortune.test" }),
    ).toThrow("http or https");
  });
});
