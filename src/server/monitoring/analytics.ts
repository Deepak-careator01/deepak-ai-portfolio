import "server-only";

import { getMonitoring } from "@/server/monitoring/monitoring";

export type AnalyticsEventName =
  | "chat_started"
  | "chat_completed"
  | "chat_failed"
  | "rate_limit_triggered"
  | "rag_hit"
  | "rag_miss"
  | "rag_failure"
  | "health_check_failed"
  | "database_error";

export type AnalyticsEvent = {
  name: AnalyticsEventName;
  timestamp: string;
  properties?: Record<string, string | number | boolean>;
};

function createEvent(
  name: AnalyticsEventName,
  properties?: Record<string, string | number | boolean>,
): AnalyticsEvent {
  return {
    name,
    timestamp: new Date().toISOString(),
    properties,
  };
}

/** Tracks a metadata-only analytics event (never includes user message content). */
export function trackAnalyticsEvent(
  name: AnalyticsEventName,
  properties?: Record<string, string | number | boolean>,
): void {
  getMonitoring().analytics.trackEvent(createEvent(name, properties));
}
