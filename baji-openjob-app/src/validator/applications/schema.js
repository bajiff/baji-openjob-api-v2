import Joi from 'joi';

const ApplicationPayloadSchema = Joi.object({
  job_id: Joi.string().required(),
  user_id: Joi.string().required(),
  status: Joi.string().required(),
});

export { ApplicationPayloadSchema };