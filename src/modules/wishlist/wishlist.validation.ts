import Joi from "joi";



export const wishlistSchema = Joi.object({
    serviceId: Joi.number().integer().positive().required()
});