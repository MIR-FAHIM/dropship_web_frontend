/**
 * One-time message for the login page after the API signed the user out
 * (expired / revoked token, banned account). Kept in sessionStorage so it
 * survives the redirect to /login but not a new tab.
 *
 *   setAuthNotice({ message, from })   // baseApi, before redirecting
 *   readAuthNotice()                    // login page: read (no side effects, safe in useState)
 *   clearAuthNotice()                   // login page: in an effect, so a reload doesn't repeat it
 */
const KEY = "rb_auth_notice";

export const setAuthNotice = (notice) => {
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify({ ...notice, at: Date.now() }));
  } catch {
    // storage blocked: the redirect still happens, just without the message
  }
};

export const clearAuthNotice = () => {
  try {
    window.sessionStorage.removeItem(KEY);
  } catch {
    // ignore
  }
};

export const readAuthNotice = () => {
  try {
    const raw = window.sessionStorage.getItem(KEY);
    if (!raw) return null;
    const notice = JSON.parse(raw);
    // Ignore stale notices (e.g. left from a much older session).
    return Date.now() - Number(notice.at || 0) < 10 * 60 * 1000 ? notice : null;
  } catch {
    return null;
  }
};
