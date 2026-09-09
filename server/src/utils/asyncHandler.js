/**
 * Express 4 does not catch rejected promises from route handlers, so every
 * async controller is wrapped to forward failures to the error handler.
 */
const asyncHandler = (handler) => (req, res, next) =>
  Promise.resolve(handler(req, res, next)).catch(next);

export default asyncHandler;
