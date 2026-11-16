/**
 * Admin "login as dropshipper" in a separate tab, without touching the admin's own login.
 *
 * The app keeps its session in localStorage ("token", "userId", "user"), which every tab of
 * the site shares. Writing a dropshipper token there would sign the admin's own tabs in as
 * that dropshipper. Instead:
 *
 *  1. The admin tab gets the dropshipper token (POST /auth/login-as-dropshipper) and leaves it
 *     under a one-time key in localStorage, then opens /impersonate#k=<key> in a new tab.
 *     The token is never put in the URL.
 *  2. In the new tab, this module (imported first in main.jsx, before the store reads anything)
 *     takes the token out, deletes the key, and marks the tab as an impersonation tab.
 *  3. In an impersonation tab, the auth keys are read and written in that tab's sessionStorage;
 *     every other key still uses the real localStorage. The admin's session is untouched,
 *     and closing the tab ends the dropshipper session.
 */

const AUTH_KEYS = new Set(["token", "userId", "user"]);
const FLAG_KEY = "rb_impersonation";
const HANDOFF_PREFIX = "rb_impersonate_";
const HANDOFF_MAX_AGE_MS = 2 * 60 * 1000;
export const IMPERSONATION_PATH = "/impersonate";
const LANDING_PATH = "/app/dashboard-new";

const realLocal = window.localStorage;
const session = window.sessionStorage;

const readJson = (storage, key) => {
  try {
    const raw = storage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

/** Info about the dropshipper this tab is signed in as, or null for a normal tab. */
export const getImpersonation = () => readJson(session, FLAG_KEY);

const installTabScopedAuth = () => {
  const shim = {
    getItem: (key) => (AUTH_KEYS.has(key) ? session.getItem(key) : realLocal.getItem(key)),
    setItem: (key, value) => (AUTH_KEYS.has(key) ? session.setItem(key, String(value)) : realLocal.setItem(key, value)),
    removeItem: (key) => (AUTH_KEYS.has(key) ? session.removeItem(key) : realLocal.removeItem(key)),
    // Only this tab's session: never wipe the admin's storage from here.
    clear: () => AUTH_KEYS.forEach((key) => session.removeItem(key)),
    key: (index) => realLocal.key(index),
    get length() {
      return realLocal.length;
    },
  };

  try {
    Object.defineProperty(window, "localStorage", { configurable: true, get: () => shim });
  } catch {
    // handled below
  }
  return window.localStorage === shim;
};

const bootstrap = () => {
  // New tab opened by the admin: pick up the handoff.
  if (window.location.pathname === IMPERSONATION_PATH) {
    const key = new URLSearchParams(window.location.hash.slice(1)).get("k");
    const handoff = key ? readJson(realLocal, HANDOFF_PREFIX + key) : null;
    if (key) realLocal.removeItem(HANDOFF_PREFIX + key);

    AUTH_KEYS.forEach((k) => session.removeItem(k));
    const fresh = handoff?.token && Date.now() - Number(handoff.at || 0) < HANDOFF_MAX_AGE_MS;

    if (fresh) {
      session.setItem("token", JSON.stringify(handoff.token));
      session.setItem("userId", JSON.stringify(handoff.userId));
      if (handoff.user) session.setItem("user", JSON.stringify(handoff.user));
    }
    session.setItem(
      FLAG_KEY,
      JSON.stringify({
        userId: handoff?.userId ?? null,
        name: handoff?.user?.name || null,
        phone: handoff?.user?.phone || null,
        startedAt: Date.now(),
        expired: !fresh,
      })
    );
    window.history.replaceState(null, "", fresh ? LANDING_PATH : "/login");
  }

  if (getImpersonation() && !installTabScopedAuth()) {
    // Browser would not let us scope storage to this tab: refuse rather than
    // sign the admin's other tabs in as the dropshipper.
    AUTH_KEYS.forEach((k) => session.removeItem(k));
    session.removeItem(FLAG_KEY);
    window.history.replaceState(null, "", "/login");
    window.__rbImpersonationUnsupported = true;
  }
};

bootstrap();

/**
 * Admin tab: hand a dropshipper token to a new tab. Pass the window opened synchronously in
 * the click handler (so popup blockers allow it). Returns false if the tab could not be opened.
 */
export const openDropshipperTab = (targetWindow, { token, user }) => {
  const key =
    (window.crypto?.randomUUID && window.crypto.randomUUID()) ||
    `${Date.now()}_${Math.random().toString(36).slice(2)}`;
  realLocal.setItem(
    HANDOFF_PREFIX + key,
    JSON.stringify({ token, userId: user?.id, user, at: Date.now() })
  );
  const url = `${IMPERSONATION_PATH}#k=${encodeURIComponent(key)}`;

  if (targetWindow && !targetWindow.closed) {
    targetWindow.location.href = url;
    return true;
  }
  const opened = window.open(url, "_blank");
  if (!opened) {
    realLocal.removeItem(HANDOFF_PREFIX + key);
    return false;
  }
  return true;
};
