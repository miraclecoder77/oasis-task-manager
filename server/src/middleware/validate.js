import { flattenError } from 'zod';
import ApiError from '../utils/ApiError.js';

/**
 * Validates one part of the request against a Zod schema and replaces it with
 * the parsed result, so controllers only ever see coerced, trusted data.
 */
const validate =
  (schema, source = 'body') =>
  (req, res, next) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      const { fieldErrors } = flattenError(result.error);
      return next(ApiError.badRequest('Validation failed', fieldErrors));
    }

    req[source] = result.data;
    return next();
  };

export default validate;
