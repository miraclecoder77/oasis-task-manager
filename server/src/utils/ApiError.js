/**
 * Any error thrown with this class is safe to show the client verbatim.
 * Anything else reaching the error handler becomes a generic 500.
 */
class ApiError extends Error {
  constructor(statusCode, message, details) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.details = details;
  }

  static badRequest(message, details) {
    return new ApiError(400, message, details);
  }

  static unauthorized(message = 'Authentication required') {
    return new ApiError(401, message);
  }

  static notFound(message = 'Not found') {
    return new ApiError(404, message);
  }
}

export default ApiError;
