import Joi from 'joi';

const BookmarkPayloadSchema = Joi.object({
  job_id: Joi.string().required(),
  user_id: Joi.string().required(),
});

export { BookmarkPayloadSchema };
