import Joi from 'joi';

const CompanyPayloadSchema = Joi.object({
  name: Joi.string().required(),
  location: Joi.string().required(),
  description: Joi.string().allow('', null),
});

export { CompanyPayloadSchema };