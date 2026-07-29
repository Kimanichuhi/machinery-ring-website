import { useEffect, useLayoutEffect } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

const STORAGE_KEY = "mr-scroll-positions";

const locationKey = (key: string, pathname: string, search: string) => key || `${pathname}${search}`;

function readPositions(): Record<string, number> {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function savePosition(key: string) {
  const positions = readPositions();
  positions[key] = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(positions));
}

/** Scrolls window and document root to top on every route change. */
export function ScrollToTop() {
  const { key, pathname, search } = useLocation();
  const navigationType = useNavigationType();

  useEffect(() => {
    if ("scrollRestoration" in window.history) window.history.scrollRestoration = "manual";
    const handlePageHide = () => savePosition(locationKey(key, pathname, search));
    window.addEventListener("pagehide", handlePageHide);
    return () => window.removeEventListener("pagehide", handlePageHide);
  }, [key, pathname, search]);

  useLayoutEffect(() => {
    const currentKey = locationKey(key, pathname, search);
    const positions = readPositions();
    const target = navigationType === "POP" ? positions[currentKey] || 0 : 0;
    const restore = () => {
      window.scrollTo(0, target);
      if (document.documentElement) document.documentElement.scrollTop = target;
      if (document.body) document.body.scrollTop = target;
    };
    restore();
    const first = requestAnimationFrame(() => {
      restore();
      requestAnimationFrame(restore);
    });
    return () => {
      savePosition(currentKey);
      cancelAnimationFrame(first);
    };
  }, [key, pathname, search, navigationType]);

  return null;
}

