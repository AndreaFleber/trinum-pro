export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

/**
 * Redirect the browser to the Google OAuth login flow.
 * Call this from an event handler — not during render.
 */
export const startLogin = () => {
  window.location.href = "/api/auth/google";
};
