import Joi from "joi";

export const availabilitySchema = Joi.object({
  serviceId: Joi.number().integer().required(),
  providerId: Joi.number().integer().required(),
  startTime: Joi.date().iso().required(),
  endTime: Joi.date().iso().greater(Joi.ref("startTime")).required(),
});

export const editAvailabilitySchema = Joi.object({
  id: Joi.number().integer().required(),
  serviceId: Joi.number().integer(),
  providerId: Joi.number().integer().required(),
  startTime: Joi.date().iso(),
  endTime: Joi.date().iso().greater(Joi.ref("startTime")),
});

export const deleteAvailability = Joi.object({
  id: Joi.number().integer().required(),
});
