import "server-only";

import type { AnalyticsEvent } from "@/server/monitoring/analytics";

export interface ErrorReporter {
  captureException(error: unknown, context?: Record<string, unknown>): void;
}

export interface PerformanceTracker {
  trackDuration(name: string, durationMs: number, metadata?: Record<string, unknown>): void;
}

export interface EventTracker {
  trackEvent(event: AnalyticsEvent): void;
}

export interface MonitoringAdapter {
  errors: ErrorReporter;
  performance: PerformanceTracker;
  analytics: EventTracker;
}

class NoOpErrorReporter implements ErrorReporter {
  captureException(): void {
    // No-op — wire Sentry or another provider via configureMonitoring().
  }
}

class NoOpPerformanceTracker implements PerformanceTracker {
  trackDuration(): void {
    // No-op
  }
}

class ConsoleEventTracker implements EventTracker {
  trackEvent(event: AnalyticsEvent): void {
    if (process.env.NODE_ENV === "production") {
      console.info(JSON.stringify({ type: "analytics_event", ...event }));
      return;
    }

    console.info(`[analytics] ${event.name}`, event.properties ?? {});
  }
}

let monitoringAdapter: MonitoringAdapter = {
  errors: new NoOpErrorReporter(),
  performance: new NoOpPerformanceTracker(),
  analytics: new ConsoleEventTracker(),
};

/** Returns the active monitoring adapter. */
export function getMonitoring(): MonitoringAdapter {
  return monitoringAdapter;
}

/** Replaces the monitoring adapter (e.g. Sentry, PostHog, Vercel Observability). */
export function configureMonitoring(adapter: Partial<MonitoringAdapter>): void {
  monitoringAdapter = {
    errors: adapter.errors ?? monitoringAdapter.errors,
    performance: adapter.performance ?? monitoringAdapter.performance,
    analytics: adapter.analytics ?? monitoringAdapter.analytics,
  };
}
