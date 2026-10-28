type SiteEnvironment = {
  SITE_URL?: string;
  VERCEL_PROJECT_PRODUCTION_URL?: string;
  VERCEL_URL?: string;
  NODE_ENV?: string;
};

const PRODUCTION_SITE_URL = "https://fortune-page-alpha.vercel.app";

export function getSiteUrl(env: SiteEnvironment = process.env): URL {
  const configuredUrl =
    env.SITE_URL ??
    (env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${env.VERCEL_PROJECT_PRODUCTION_URL}`
      : env.VERCEL_URL
        ? `https://${env.VERCEL_URL}`
        : env.NODE_ENV === "production"
          ? PRODUCTION_SITE_URL
          : undefined);

  if (!configuredUrl) {
    return new URL("http://localhost:3000");
  }

  const url = new URL(configuredUrl);
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("SITE_URL must use the http or https protocol.");
  }

  return new URL(url.origin);
}
