import "server-only";

export type LogLevel = "info" | "warn" | "error";

export type RequestLogContext = {
  requestId: string;
  threadId?: string;
  ip?: string;
  userAgent?: string;
  model?: string;
};

export type ChatRequestLogEvent = RequestLogContext & {
  level: LogLevel;
  stage: string;
  timestamp: string;
  latencyMs?: number;
  ragHits?: number;
  memoryUsed?: boolean;
  status?: string;
  error?: string;
  inputMessages?: number;
  messagesSentToLLM?: number;
  timeToFirstTokenMs?: number;
  llmGenerationMs?: number;
  inputTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
  metadata?: Record<string, unknown>;
};

/** Generates a short request identifier for tracing. */
export function generateRequestId(): string {
  return `req_${crypto.randomUUID().replace(/-/g, "").slice(0, 12)}`;
}

function writeLog(event: ChatRequestLogEvent): void {
  const payload = JSON.stringify(event);

  if (event.level === "error") {
    console.error(payload);
    return;
  }

  if (event.level === "warn") {
    console.warn(payload);
    return;
  }

  console.info(payload);
}

/** Structured logger for chat request lifecycle events. */
export function createRequestLogger(context: RequestLogContext) {
  const base = { ...context };

  const log = (
    level: LogLevel,
    stage: string,
    fields: Partial<Omit<ChatRequestLogEvent, "level" | "stage" | "timestamp" | "requestId">> = {},
  ) => {
    writeLog({
      ...base,
      ...fields,
      level,
      stage,
      timestamp: new Date().toISOString(),
      requestId: base.requestId,
    });
  };

  return {
    info: (stage: string, fields?: Partial<ChatRequestLogEvent>) => log("info", stage, fields),
    warn: (stage: string, fields?: Partial<ChatRequestLogEvent>) => log("warn", stage, fields),
    error: (stage: string, fields?: Partial<ChatRequestLogEvent>) => log("error", stage, fields),
  };
}

/** Extracts client IP from common proxy headers. */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }

  return request.headers.get("x-real-ip")?.trim() || "unknown";
}
