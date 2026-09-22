"use client";

import { useSyncExternalStore } from "react";

/**
 * True on coarse-pointer (touch) devices.
 *
 * Replaces the `useState(false)` + `useEffect(() => setIsTouch(...))` pattern
 * that ScrollReveal and HomeClient both used. That pattern renders once with
 * the wrong value and then immediately again with the right one — cheap in one
 * component, but ScrollReveal is mounted dozens of times per page, so it was a
 * double render of nearly every section on every navigation.
 *
 * useSyncExternalStore reads the value during render instead, and subscribes so
 * the answer stays correct if the pointer type changes (a tablet gaining a
 * mouse, or devtools device emulation).
 *
 * The server snapshot is `false`, matching the old initial state, so server and
 * first client render still agree and hydration is unaffected.
 */

const QUERY = "(pointer: coarse)";

function subscribe(onChange: () => void) {
  if (typeof window === "undefined" || !window.matchMedia) return () => {};
  const mql = window.matchMedia(QUERY);
  // addEventListener is unavailable on MediaQueryList in older Safari.
  if (mql.addEventListener) {
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }
  mql.addListener(onChange);
  return () => mql.removeListener(onChange);
}

function getSnapshot() {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia(QUERY).matches;
}

function getServerSnapshot() {
  return false;
}

export function usePointerCoarse(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
