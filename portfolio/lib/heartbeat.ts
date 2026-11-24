export const HEARTBEAT_INTERVAL_MS = 60_000;

/** Heartbeats are only sent while the tab is visible. */
export function shouldSend(visibilityState: string): boolean {
  return visibilityState === "visible";
}
