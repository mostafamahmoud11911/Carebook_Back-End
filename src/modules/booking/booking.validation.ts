import Joi from "joi";



const createBookingSchema = Joi.object({
    availabilityId: Joi.number().required()
});


// const updateBookingSchema = Joi.object({
//     bookingId: Joi.number().required(),
//     startTime: 
// })



const cancelBookingSchema = Joi.object({
    id: Joi.number().required(),
})
export {
    createBookingSchema,
    cancelBookingSchema
}