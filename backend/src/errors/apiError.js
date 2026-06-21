export class ApiError extends Error {
  constructor(statusCode, code, message) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.code = code;
  }
}

export function badRequest(message) {
  return new ApiError(400, "bad_request", message);
}

export function notFound(message) {
  return new ApiError(404, "not_found", message);
}
