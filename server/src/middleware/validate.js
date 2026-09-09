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
      const { fieldErrors, formErrors } = flattenError(result.error);

      // Whole-object rules (e.g. "at least one field") have no field to hang
      // off, so they become the top-level message instead of empty details.
      if (Object.keys(fieldErrors).length === 0 && formErrors.length > 0) {
        return next(ApiError.badRequest(formErrors[0]));
      }

      return next(ApiError.badRequest('Validation failed', fieldErrors));
    }

    req[source] = result.data;
    return next();
  };

export default validate;
