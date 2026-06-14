import Joi from 'joi';

const CategoryPayloadSchema = Joi.object({
  name: Joi.string().required(),
});

export { CategoryPayloadSchema };