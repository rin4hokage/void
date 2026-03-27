const ADMIN_CODE_KEY = "void-admin-code";

export const getStoredAdminCode = () => {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(ADMIN_CODE_KEY);
};

export const getEffectiveAdminCode = () => {
  const stored = getStoredAdminCode();
  return stored || import.meta.env.VITE_VOID_ADMIN_CODE || "Gigihadid20#12345";
};

export const setStoredAdminCode = (code: string) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ADMIN_CODE_KEY, code);
  window.dispatchEvent(new CustomEvent("void-admin-code-updated"));
};
