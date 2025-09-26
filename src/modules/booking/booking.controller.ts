import { Request, Response } from "express";
import { createError } from "../../../middleware/createError";
import ApiError from "../../../utils/ApiError";
import Booking from "../../../db/models/booking.model";
import Availability from "../../../db/models/availability.model";
import { google } from "googleapis";
import User from "../../../db/models/user.model";
import dotenv from "dotenv";

dotenv.config();

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

export const createBooking = createError(
  async (req: Request, res: Response) => {
    const { availabilityId } = req.body;
    const clientId = req.user?.id;

    const availability = await Availability.findByPk(availabilityId);
    if (!availability) throw new ApiError("Availability slot not found", 404);
    if (availability.isBooked) throw new ApiError("Slot already booked", 400);

    // احجز
    const booking = await Booking.create({
      availabilityId,
      clientId,
      providerId: availability.providerId,
      serviceId: availability.serviceId,
      status: "confirmed",
    });

    // علم الـ availability انه محجوز
    availability.isBooked = true;
    await availability.save();

    // مزامنة مع Google Calendar للـ Provider
    const provider = await User.findByPk(availability.providerId);
    if (provider?.googleRefreshToken) {
      oauth2Client.setCredentials({
        refresh_token: provider.googleRefreshToken,
      });
      const calendar = google.calendar({ version: "v3", auth: oauth2Client });

      await calendar.events.insert({
        calendarId: "primary",
        requestBody: {
          summary: `Booking #${booking.id} - Service #${availability.serviceId}`,
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
  const role = req.user?.role;

  let bookings;

  if (role === "user") {
    bookings = await Booking.findAll({ where: { clientId: userId } });
  } else if (role === "provider") {
    bookings = await Booking.findAll({ where: { providerId: userId } });
  } else if (role === "admin") {
    bookings = await Booking.findAll();
  }

  res.status(200).json({ bookings });
});

// ================== UPDATE BOOKING (Reschedule) ==================
export const updateBooking = createError(
  async (req: Request, res: Response) => {
    const { bookingId } = req.params;
    const { startTime, endTime } = req.body;
    const role = req.user?.role;
    const userId = req.user?.id;

    const booking = await Booking.findByPk(bookingId);
    if (!booking) throw new ApiError("Booking not found", 404);

    // لازم اليوزر الي عمل الbook
    if (role === "provider" && booking.providerId !== userId) {
      throw new ApiError("Not authorized to update this booking", 403);
    }

    // تحديث التواريخ
    booking.startTime = new Date(startTime);
    booking.endTime = new Date(endTime);
    await booking.save();

    // Google Calendar sync
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

// ================== CANCEL BOOKING ==================
export const cancelBooking = createError(
  async (req: Request, res: Response) => {
    const { bookingId } = req.params;
    const role = req.user?.role;
    const userId = req.user?.id;

    const booking = await Booking.findByPk(bookingId);
    if (!booking) throw new ApiError("Booking not found", 404);

    // صلاحيات الإلغاء
    if (role === "user" && booking.clientId !== userId) {
      throw new ApiError("Not authorized", 403);
    }
    if (role === "provider" && booking.providerId !== userId) {
      throw new ApiError("Not authorized", 403);
    }

    booking.status = "cancelled";
    await booking.save();

    // تحديث availability
    const availability = await Availability.findByPk(booking.availabilityId);
    if (availability) {
      availability.isBooked = false;
      await availability.save();
    }

    res.status(200).json({ message: "Booking cancelled", booking });
  }
);
