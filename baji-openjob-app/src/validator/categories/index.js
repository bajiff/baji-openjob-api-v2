import { CategoryPayloadSchema } from './schema.js';
import InvariantError from '../../exceptions/InvariantError.js';

const CategoriesValidator = {
  validateCategoryPayload: (payload) => {
    const validationResult = CategoryPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

export default CategoriesValidator;