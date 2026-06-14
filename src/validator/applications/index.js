import { ApplicationPayloadSchema } from './schema.js';
import InvariantError from '../../exceptions/InvariantError.js';

const ApplicationsValidator = {
  validateApplicationPayload: (payload) => {
    const validationResult = ApplicationPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

export default ApplicationsValidator;