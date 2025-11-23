import express from "express";
import auth from "../../../middleware/auth";
import authGuard from "../../../middleware/authGuard";
import {
  cancelBooking,
  createBooking,
  getBookings,
  updateBooking,
} from "./booking.controller";
import validate from "../../../middleware/validate";
import { cancelBookingSchema, createBookingSchema } from "./booking.validation";

const bookingRouter = express.Router();

bookingRouter.get("/", auth, getBookings);
bookingRouter.post("/", auth, authGuard("user", "admin"), createBooking);
bookingRouter.put("/:id", validate(createBookingSchema), auth, authGuard("provider"), updateBooking);
bookingRouter.delete("/:id", validate(cancelBookingSchema), auth, authGuard("provider", "user"), cancelBooking);

export default bookingRouter;
