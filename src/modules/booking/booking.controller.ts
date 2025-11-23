import { NextFunction, Request, Response } from "express";
import { createError } from "../../../middleware/createError";
import ApiError from "../../../utils/ApiError";
import Booking from "../../../db/models/booking.model";
import Availability from "../../../db/models/availability.model";
import { google } from "googleapis";
import User from "../../../db/models/user.model";
import dotenv from "dotenv";
import { UserJWT } from "../../../types";
import { Service } from "../../../db/models";

dotenv.config();

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URI,
);

export const createBooking = createError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { availabilityId } = req.body;
    const clientId = req.user?.id;


    const availability = await Availability.findByPk(availabilityId);
    if (!availability) return next(new ApiError("Availability slot not found", 404));
    if (availability.isBooked) return next(new ApiError("Slot already booked", 400));

    const booking = await Booking.create({
      availabilityId,
      clientId,
      providerId: availability.providerId,
      serviceId: availability.serviceId,
      startTime: availability.startTime,
      endTime: availability.endTime,
      status: "confirmed",
    });


    availability.isBooked = true;
    await availability.save();

    const provider = await User.findByPk(availability.providerId);
    if (provider?.googleRefreshToken) {
      oauth2Client.setCredentials({
        refresh_token: provider.googleRefreshToken,
      });
      const calendar = google.calendar({ version: "v3", auth: oauth2Client });

      await calendar.events.insert({
        calendarId: "primary",
        requestBody: {
          summary: `📅 ${availability.service?.name || "Service"} with ${booking.user?.username || "Client"}  
🕒 ${new Date(booking.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(booking.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}  
📍 Status: ${booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}`,
          start: { dateTime: availability.startTime.toISOString() },
          end: { dateTime: availability.endTime.toISOString() },
        },
      });
    }

    res.status(201).json({ message: "Booking confirmed", booking });
  }
);

export const getBookings = createError(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const role = (req.user as UserJWT).role;

  let bookings;

  if (role === "user") {
    bookings = await Booking.findAll({ where: { clientId: userId }, include: [{ model: User, as: "client" }, { model: Service, as: "service" }] });
  } else if (role === "provider") {
    bookings = await Booking.findAll({ where: { providerId: userId }, include: [{ model: User, as: "client" }, { model: Service, as: "service" }] });
  } else if (role === "admin") {
    bookings = await Booking.findAll({ include: [{ model: User, as: "client" }, { model: Service, as: "service" }] });
  }

  res.status(200).json({ bookings });
});


export const updateBooking = createError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { bookingId } = req.params;
    const { startTime, endTime } = req.body;
    const role = (req.user as UserJWT).role;
    const userId = req.user?.id;

    const booking = await Booking.findByPk(bookingId);
    if (!booking) return next(new ApiError("Booking not found", 404));


    if (role === "provider" && booking.providerId !== userId) {
      return next(new ApiError("Not authorized to update this booking", 403));
    }


    booking.startTime = new Date(startTime);
    booking.endTime = new Date(endTime);
    await booking.save();


    const provider = await User.findByPk(booking.providerId);
    if (provider?.googleRefreshToken) {
      oauth2Client.setCredentials({
        refresh_token: provider.googleRefreshToken,
      });
      const calendar = google.calendar({ version: "v3", auth: oauth2Client });

      await calendar.events.insert({
        calendarId: "primary",
        requestBody: {
          summary: `Booking #${booking.id} - Service #${booking.serviceId}`,
          start: { dateTime: booking.startTime.toISOString() },
          end: { dateTime: booking.endTime.toISOString() },
        },
      });
    }

    res.status(200).json({ message: "Booking updated", booking });
  }
);


export const cancelBooking = createError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const role = (req.user as UserJWT).role;
    const userId = req.user?.id;

    const booking = await Booking.findByPk(id);
    if (!booking) return next(new ApiError("Booking not found", 404));

    const availability = await Availability.findByPk(booking.availabilityId);
    if (!availability) return next(new ApiError("Availability slot not found", 404));

    if (role === "user" && booking.clientId !== userId) {
      return next(new ApiError("Not authorized", 403))
    }
    if (role === "provider" && booking.providerId !== userId) {
      return next(new ApiError("Not authorized", 403))
    }



    availability.isBooked = false
    await booking.destroy()


    res.status(200).json({ message: "Booking deleted" });
  }
);
