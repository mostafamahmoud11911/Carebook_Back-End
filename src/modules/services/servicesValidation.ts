import Joi from "joi";

const createServiceSchema = Joi.object({
  name: Joi.string().min(3).max(100).required(),
  duration: Joi.string().required(),
  price: Joi.number().positive().required(),
  offers: Joi.string(),
  image: Joi.any().optional(),
  images: Joi.array().items(Joi.any()).optional(),
  userId: Joi.number().integer().positive(),
});

const getServiceSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
});

const updateServiceSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
  name: Joi.string().min(3).max(100).optional(),
  duration: Joi.string().optional(),
  price: Joi.number().positive().optional(),
  offers: Joi.string().optional(),
  image: Joi.object().optional(),
  images: Joi.array().items(Joi.object()).optional(),
  rate: Joi.number().min(0).max(5).optional(),
  userId: Joi.number().integer().positive(),
});

const deleteServiceSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
});

export {
  createServiceSchema,
  getServiceSchema,
  updateServiceSchema,
  deleteServiceSchema,
};
