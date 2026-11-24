"use client";

import { useSyncExternalStore } from "react";

type Theme = "light" | "dark";

const listeners = new Set<() => void>();

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

// The inline script in app/layout.tsx has already set data-theme before paint.
function getSnapshot(): Theme {
  return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
}

function getServerSnapshot(): Theme {
  return "light";
}

export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const dark = theme === "dark";

  function toggle() {
    const next: Theme = dark ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("theme", next);
    } catch {
      // Storage unavailable (private mode): the choice lasts for this page only.
    }
    listeners.forEach((l) => l());
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={dark}
      className="ml-auto rounded-md border border-[color:var(--border)] px-2.5 py-1 text-sm font-medium text-[color:var(--muted)] hover:text-[color:var(--text)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--primary)]"
    >
      Dark mode
    </button>
  );
}
