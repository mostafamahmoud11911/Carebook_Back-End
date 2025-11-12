import Joi from "joi";

const registerSchema = Joi.object({
  username: Joi.string().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(30).required(),
  role: Joi.string().valid("admin", "user", "provider").default("user"),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(30).required(),
});


const approveProviderSchema = Joi.object({
  userId: Joi.number().required(),
});

const declineProviderSchema = Joi.object({
  id: Joi.number().required(),
})

export { registerSchema, loginSchema, approveProviderSchema, declineProviderSchema };
