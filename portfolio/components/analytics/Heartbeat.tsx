"use client";

import { useEffect } from "react";
import { HEARTBEAT_INTERVAL_MS, shouldSend } from "@/lib/heartbeat";

/** Pings /api/heartbeat while the tab is open and visible. Sends no personal data. */
export function Heartbeat() {
  useEffect(() => {
    const send = () => {
      if (!shouldSend(document.visibilityState)) return;
      fetch("/api/heartbeat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: "{}",
        keepalive: true,
        credentials: "same-origin",
      }).catch(() => {});
    };
    send();
    const id = window.setInterval(send, HEARTBEAT_INTERVAL_MS);
    document.addEventListener("visibilitychange", send);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", send);
    };
  }, []);
  return null;
}
