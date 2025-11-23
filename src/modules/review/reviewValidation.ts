import Joi from "joi";


const addReviewValidation = Joi.object({
    rating: Joi.number().min(1).max(5).required(),
    comment: Joi.string().min(10).max(5000).required(),
    serviceId: Joi.number()
});

const getReviewValidation = Joi.object({
    id: Joi.number()
})

const deleteReviewValidation = Joi.object({
    id: Joi.number()
});


export {
    addReviewValidation,
    getReviewValidation,
    deleteReviewValidation
}