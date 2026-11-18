// US state privacy opt-out ("Do Not Sell or Share"). Honors the Global Privacy Control browser signal.
const KEY = "privacy-optout";

export function gpcEnabled(): boolean {
  try {
    return (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl === true;
  } catch {
    return false;
  }
}

export function isOptedOut(): boolean {
  if (typeof window === "undefined") return false;
  if (gpcEnabled()) return true;
  try {
    return localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

export function setOptOut(v: boolean) {
  try {
    if (v) localStorage.setItem(KEY, "1");
    else localStorage.removeItem(KEY);
  } catch {}
}
