"use client";
import { usePathname } from "next/navigation";
import React from "react";
import { ReactNode } from "react";

function AppBar() {
  const path = usePathname();
  return (
    <header
      className={`w-full px-16 py-5 bg-light-surfaceContainer dark:bg-dark-surfaceContainer text-light-onSurface dark:text-dark-onSurface ${
        path.startsWith("/api") ? "hidden" : "flex items-center justify-center"
      }`}
    >
        <h1>InterviewHero</h1>
    </header>
  );
}

export default AppBar;
