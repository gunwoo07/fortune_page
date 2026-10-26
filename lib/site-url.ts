type SiteEnvironment = {
  SITE_URL?: string;
  VERCEL_PROJECT_PRODUCTION_URL?: string;
  VERCEL_URL?: string;
  NODE_ENV?: string;
};

export function getSiteUrl(env: SiteEnvironment = process.env): URL {
  const configuredUrl =
    env.SITE_URL ??
    (env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${env.VERCEL_PROJECT_PRODUCTION_URL}`
      : env.VERCEL_URL
        ? `https://${env.VERCEL_URL}`
        : undefined);

  if (!configuredUrl) {
    if (env.NODE_ENV === "production") {
      throw new Error(
        "SITE_URL must be set to the public site origin before production build.",
      );
    }

    return new URL("http://localhost:3000");
  }

  const url = new URL(configuredUrl);
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("SITE_URL must use the http or https protocol.");
  }

  return new URL(url.origin);
}
