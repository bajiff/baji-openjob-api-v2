import { CompanyPayloadSchema } from './schema.js';
import InvariantError from '../../exceptions/InvariantError.js';

const CompaniesValidator = {
  validateCompanyPayload: (payload) => {
    const validationResult = CompanyPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

export default CompaniesValidator;