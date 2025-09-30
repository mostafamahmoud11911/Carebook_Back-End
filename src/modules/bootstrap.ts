import { Application } from "express";
import userRouter from "./user/user.router";
import authRouter from "./auth/authRouter";
import servicesRouter from "./services/servicesRouter";
import wishlistRouter from "./wishlist/wishlist.router";
import availabilityRouter from "./availability/availability.router";
import bookingRouter from "./booking/booking.router";
import dashboardRouter from "./dashboard/dashboard.router";

export default function bootstrap(app: Application) {
  app.use("/api/auth", authRouter);
  app.use("/api/users", userRouter);
  app.use("/api/services", servicesRouter);
  app.use("/api/wishlist", wishlistRouter);
  app.use("/api/availability", availabilityRouter);
  app.use("/api/bookings", bookingRouter);
  app.use("/api/status", dashboardRouter);
}
