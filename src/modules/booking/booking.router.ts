import express from "express";
import auth from "../../../middleware/auth";
import authGuard from "../../../middleware/authGuard";
import {
  cancelBooking,
  createBooking,
  getBookings,
  updateBooking,
} from "./booking.controller";

const bookingRouter = express.Router();

bookingRouter.get("/", auth, getBookings);
bookingRouter.post("/", auth, authGuard("user"), createBooking);
bookingRouter.put("/:id", auth, authGuard("provider", "admin"), updateBooking);
bookingRouter.delete("/:id", auth, cancelBooking);

export default bookingRouter;
