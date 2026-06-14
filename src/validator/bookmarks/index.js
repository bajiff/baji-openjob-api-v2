import { BookmarkPayloadSchema } from './schema.js';
import InvariantError from '../../exceptions/InvariantError.js';

const BookmarksValidator = {
  validateBookmarkPayload: (payload) => {
    const validationResult = BookmarkPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

export default BookmarksValidator;
