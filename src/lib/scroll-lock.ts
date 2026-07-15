/**
 * Shared, ref-counted body scroll lock.
 *
 * Why this exists: the mobile menu and the quote/showroom form drawers each used
 * to lock body scroll independently — the menu with the iOS `position: fixed`
 * technique, the modals with `overflow: hidden` only. Opening one while the
 * other was active let them clobber each other's body styles, occasionally
 * leaving the page scroll-locked ("frozen") after a menu/modal closed. iOS
 * Safari also ignores `body { overflow: hidden }`, so the modal lock leaked the
 * background scroll on iPhone.
 *
 * This centralises locking so any number of overlays can lock in any order and
 * scroll is released (and restored) only when the last one unlocks.
 *
 * On touch devices (where the scroll bug lives and Lenis is disabled) it uses
 * the robust `position: fixed` technique. On desktop it uses `overflow: hidden`
 * only, to avoid fighting the Lenis smooth-scroll controller.
 */
let lockCount = 0;
let savedScrollY = 0;
let usedFixed = false;

export function lockScroll(): void {
  if (typeof document === "undefined") return;
  lockCount += 1;
  if (lockCount > 1) return; // already locked by another overlay

  const body = document.body;
  savedScrollY = window.scrollY;
  usedFixed = window.matchMedia("(pointer: coarse)").matches;

  body.style.overflow = "hidden";
  if (usedFixed) {
    body.style.position = "fixed";
    body.style.top = `-${savedScrollY}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";
  }
}

export function unlockScroll(): void {
  if (typeof document === "undefined") return;
  if (lockCount === 0) return;
  lockCount -= 1;
  if (lockCount > 0) return; // still held by another overlay

  const body = document.body;
  body.style.overflow = "";
  if (usedFixed) {
    body.style.position = "";
    body.style.top = "";
    body.style.left = "";
    body.style.right = "";
    body.style.width = "";
    window.scrollTo(0, savedScrollY);
  }
  usedFixed = false;
}
