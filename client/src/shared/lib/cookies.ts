export const setCookie = (name: string, value: string, days = 7): void => {
  if (typeof document === "undefined") return;

  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  const secure = typeof window !== "undefined" && window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax${secure}`;
};

export const getCookie = (name: string): string | null => {
  if (typeof document === "undefined") return null;

  const cookies = document.cookie ? document.cookie.split("; ") : [];
  for (const cookie of cookies) {
    const [k, ...v] = cookie.split("=");
    if (decodeURIComponent(k) === name) {
      try {
        return decodeURIComponent(v.join("="));
      } catch {
        return v.join("=");
      }
    }
  }
  return null;
};

export const removeCookie = (name: string): void => {
  if (typeof document === "undefined") return;
  document.cookie = `${encodeURIComponent(name)}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`;
};
