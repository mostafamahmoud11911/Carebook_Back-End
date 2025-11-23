import Joi from "joi";

const createUserSchema = Joi.object({
  username: Joi.string().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(30).required(),
  role: Joi.string().valid("admin", "user", "provider").default("user"),
});

const getUserSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
});

const updateUserSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
  username: Joi.string().min(3).max(30).optional(),
  email: Joi.string().email().optional(),
  password: Joi.string().min(6).max(30).optional(),
  role: Joi.string().valid("admin", "user", "provider").optional(),
});

const deleteUserSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
});

export { createUserSchema, getUserSchema, updateUserSchema, deleteUserSchema };
