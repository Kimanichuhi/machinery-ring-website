import React from "react";
import { useLocation } from "react-router-dom";

/** Simple fade+slide-in on every route change via a keyed wrapper. */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  return (
    <div key={pathname} className="animate-page-in">
      {children}
    </div>
  );
}
