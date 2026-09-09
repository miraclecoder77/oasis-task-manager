import ApiError from '../utils/ApiError.js';

export const notFoundHandler = (req, res, next) => {
  next(ApiError.notFound(`Route ${req.method} ${req.originalUrl} not found`));
};

// The unused `next` is required: Express identifies error handlers by arity.
export const errorHandler = (error, req, res, next) => {
  if (error instanceof ApiError) {
    const body = { error: { message: error.message } };
    if (error.details) body.error.details = error.details;
    return res.status(error.statusCode).json(body);
  }

  process.stderr.write(`[error] ${req.method} ${req.originalUrl} ${error.stack}\n`);
  return res
    .status(500)
    .json({ error: { message: 'Something went wrong' } });
};
