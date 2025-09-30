import { google } from "googleapis";
import Availability from "../../../db/models/availability.model";
import User from "../../../db/models/user.model";
import { NextFunction, Request, Response } from "express";
import { createError } from "../../../middleware/createError";
import ApiError from "../../../utils/ApiError";
import dotenv from "dotenv";
import { UserJWT } from "../../../types";

dotenv.config();

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.CLIENT_SECRET,
  "postmessage"
);

export const getAvailability = createError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { serviceId, providerId } = req.params;

    if (!serviceId || !providerId) {
      return next(new ApiError("serviceId and providerId are required", 400));
    }

    const availabilities = await Availability.findAll({
      where: { serviceId, providerId },
      attributes: ["id", "startTime", "endTime", "googleEventId", "isBooked"],
      order: [["startTime", "ASC"]],
    });

    res.status(200).json({ availabilities });
  }
);

export const addAvailability = createError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { serviceId, startTime, endTime } = req.body;
    const providerId = req.user?.id as UserJWT["id"];

    const provider = await User.findByPk(providerId);
    if (!provider) return next(new ApiError("Provider not found", 404));

    if (!provider.googleRefreshToken) {
      return next(
        new ApiError("Provider not connected to Google Calendar", 400)
      );
    }

    // هنا نفترض إنك مخزن refreshToken للبروفايدر
    oauth2Client.setCredentials({ refresh_token: provider.googleRefreshToken });

    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    // أضف الحدث في Google Calendar
    const event = {
      summary: `Service #${serviceId} Availability`,
      start: { dateTime: new Date(startTime).toISOString(), timeZone: "UTC" },
      end: { dateTime: new Date(endTime).toISOString(), timeZone: "UTC" },
    };

    const createdEvent = await calendar.events.insert({
      calendarId: "primary",
      requestBody: event,
    });

    // خزّن في DB
    const availability = await Availability.create({
      providerId,
      serviceId,
      startTime,
      endTime,
      googleEventId: createdEvent.data.id!,
      isBooked: false,
    });

    res.status(201).json({
      message: "Availability added and synced with Google Calendar",
      availability,
    });
  }
);

export const updateAvailability = createError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { availabilityId } = req.params;
    const { serviceId, startTime, endTime, isBooked } = req.body;
    const providerId = req.user?.id as number;

    // 1️⃣ هات الـ availability من DB
    const availability = await Availability.findByPk(availabilityId);
    if (!availability) {
      return next(new ApiError("Availability not found", 404));
    }

    // اتأكد إن اللي بيعدل هو صاحب الـ availability
    if (availability.providerId !== providerId) {
      return next(
        new ApiError("Not authorized to update this availability", 403)
      );
    }

    // 2️⃣ هات الـ provider و refresh token
    const provider = await User.findByPk(providerId);
    if (!provider?.googleRefreshToken) {
      return next(new ApiError("Google account not linked", 400));
    }

    oauth2Client.setCredentials({ refresh_token: provider.googleRefreshToken });
    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    // 3️⃣ جهز الـ event الجديد
    const eventUpdate: any = {};
    if (serviceId) eventUpdate.summary = `Service #${serviceId} Availability`;
    if (startTime)
      eventUpdate.start = { dateTime: new Date(startTime).toISOString() };
    if (endTime)
      eventUpdate.end = { dateTime: new Date(endTime).toISOString() };

    // 4️⃣ عدل في Google Calendar
    await calendar.events.update({
      calendarId: "primary",
      eventId: availability.googleEventId,
      requestBody: {
        ...eventUpdate,
      },
    });

    // 5️⃣ عدل في DB
    if (serviceId) availability.serviceId = serviceId;
    if (startTime) availability.startTime = startTime;
    if (endTime) availability.endTime = endTime;
    if (isBooked) availability.isBooked = isBooked;

    await availability.save();

    res.status(200).json({
      message: "Availability updated and synced with Google Calendar",
      availability,
    });
  }
);

export const deleteAvailability = createError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { availabilityId } = req.params;
    const providerId = req.user?.id as number;

    const availability = await Availability.findOne({
      where: { id: availabilityId, providerId },
    });
    if (!availability) return next(new ApiError("Availability not found", 404));

    const provider = await User.findByPk(providerId);
    if (!provider?.googleRefreshToken) {
      return next(
        new ApiError("Provider not connected with Google Calendar", 400)
      );
    }

    oauth2Client.setCredentials({ refresh_token: provider.googleRefreshToken });
    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    // احذف الحدث من Google Calendar
    if (availability.googleEventId) {
      await calendar.events.delete({
        calendarId: "primary",
        eventId: availability.googleEventId,
      });
    }

    // احذف من DB
    await availability.destroy();

    res.status(200).json({
      message: "Availability deleted successfully",
    });
  }
);
