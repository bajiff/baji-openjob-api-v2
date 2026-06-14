import Joi from 'joi';

const JobPayloadSchema = Joi.object({
  company_id: Joi.string().required(),
  category_id: Joi.string().required(),
  title: Joi.string().required(),
  description: Joi.string().required(),
  job_type: Joi.string().required(),
  experience_level: Joi.string().required(),
  location_type: Joi.string().required(),
  location_city: Joi.string(),
  salary_min: Joi.number(),
  salary_max: Joi.number(),
  is_salary_visible: Joi.boolean(),
  status: Joi.string(),
});

const UpdateJobPayloadSchema = Joi.object({
  company_id: Joi.string(),
  category_id: Joi.string(),
  title: Joi.string(),
  description: Joi.string(),
  job_type: Joi.string(),
  experience_level: Joi.string(),
  location_type: Joi.string(),
  location_city: Joi.string(),
  salary_min: Joi.number(),
  salary_max: Joi.number(),
  is_salary_visible: Joi.boolean(),
  status: Joi.string()
})

export { JobPayloadSchema, UpdateJobPayloadSchema };