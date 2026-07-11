export const ENV = {
  cookieSecret: process.env.JWT_SECRET ?? process.env.SESSION_SECRET ?? "",
  databaseUrl: process.env.SUPABASE_DATABASE_URL ?? "",
  googleClientId: process.env.GOOGLE_CLIENT_ID ?? "",
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
  isProduction: process.env.NODE_ENV === "production",
  /**
   * Optional canonical base URL (e.g. https://myapp.replit.app).
   * When set, the Google OAuth redirect_uri is derived from this value
   * instead of request headers, which prevents host-header manipulation.
   */
  appBaseUrl: process.env.APP_BASE_URL ?? "",
  // Notification service (optional)
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
};
