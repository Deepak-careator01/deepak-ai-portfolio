import "server-only";

export type ApiErrorBody = {
  error: string;
  requestId?: string;
};

export function jsonErrorResponse(
  message: string,
  status: number,
  requestId?: string,
): Response {
  const body: ApiErrorBody = { error: message };

  if (requestId) {
    body.requestId = requestId;
  }

  return Response.json(body, { status });
}

export function badRequest(message: string, requestId?: string): Response {
  return jsonErrorResponse(message, 400, requestId);
}

export function unauthorized(message: string, requestId?: string): Response {
  return jsonErrorResponse(message, 401, requestId);
}

export function rateLimited(message: string, requestId?: string): Response {
  return jsonErrorResponse(message, 429, requestId);
}

export function internalError(message: string, requestId?: string): Response {
  return jsonErrorResponse(message, 500, requestId);
}

export function serviceUnavailable(message: string, requestId?: string): Response {
  return jsonErrorResponse(message, 503, requestId);
}
