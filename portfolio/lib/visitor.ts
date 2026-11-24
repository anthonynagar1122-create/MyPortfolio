import { createHash } from "node:crypto";
import { site } from "./config";

/** SHA-256 hex of `ip|ua|day|secret`. The raw IP is never stored or returned. */
export function visitorHash(ip: string, userAgent: string, day: string, secret: string): string {
  return createHash("sha256").update(`${ip}|${userAgent}|${day}|${secret}`).digest("hex");
}

const BOT_PATTERN = /bot|crawl|spider|slurp|facebookexternalhit|preview|headless|curl|wget|python-requests|httpclient|monitor|lighthouse/i;

export function isLikelyBot(userAgent: string): boolean {
  const ua = userAgent.trim();
  return ua === "" || BOT_PATTERN.test(ua);
}

/** Current date as YYYY-MM-DD in the given IANA timezone (defaults to site.timezone). */
export function today(timezone: string = site.timezone, now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}
