import { google } from "googleapis";
import Availability from "../../../db/models/availability.model";
import User from "../../../db/models/user.model";
import { NextFunction, Request, Response } from "express";
import { createError } from "../../../middleware/createError";
import ApiError from "../../../utils/ApiError";
import dotenv from "dotenv";
import { UserJWT } from "../../../types";
import { Service } from "../../../db/models";

dotenv.config();

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URI,
);

export const getAvailabilities = createError(
  async (req: Request, res: Response, next: NextFunction) => {
    // if role provider it will take the login user id 
    const isProvider = (req.user as UserJWT).role === "provider" ? {
      providerId: (req.user as UserJWT).id
    } : {};

    // pagination
    const totalCount = await Availability.count();
    const page = Number(req.query.page) || 1;
    const limit = Math.max(Number(req.query.limit) || 10, 1);
    const skip = (page - 1) * limit;

    const availabilities = await Availability.findAll({
      where: isProvider,
      offset: skip,
      limit,
      include: [{ model: User, as: "provider", attributes: ["id", "username", "email"] }, { model: Service, as: "service", attributes: ["id", "name"] }]
    });
    res.status(200).json({
      totalCount,
      page,
      availabilities,
    });
  }
);

export const addAvailability = createError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { serviceId, startTime, endTime, providerId: bodyProviderId } = req.body;

    const user = req.user as UserJWT;

    // if role is provider it will take id user login if not front will send provider selected
    const providerId = user.role === "provider" ? user.id : bodyProviderId;
    if (!providerId) return next(new ApiError("Provider ID is required", 400));

    const provider = await User.findByPk(providerId);
    if (!provider) return next(new ApiError("Provider not found", 404));


    if (!provider.googleRefreshToken) {
      return next(new ApiError("Provider not connected to Google Calendar", 400));
    }


    oauth2Client.setCredentials({ refresh_token: provider.googleRefreshToken });
    const calendar = google.calendar({ version: "v3", auth: oauth2Client });


    const service = await Service.findByPk(serviceId);
    const event = {
      summary: `${service?.name} | New Time Slot`,
      start: { dateTime: new Date(startTime).toISOString(), timeZone: "UTC" },
      end: { dateTime: new Date(endTime).toISOString(), timeZone: "UTC" },
    };

    const createdEvent = await calendar.events.insert({
      calendarId: "primary",
      requestBody: event,
    });


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

    const availability = await Availability.findByPk(availabilityId);
    if (!availability) {
      return next(new ApiError("Availability not found", 404));
    }

    if (availability.providerId !== providerId) {
      return next(
        new ApiError("Not authorized to update this availability", 403)
      );
    }

    const provider = await User.findByPk(providerId);
    if (!provider?.googleRefreshToken) {
      return next(new ApiError("Google account not linked", 400));
    }

    oauth2Client.setCredentials({ refresh_token: provider.googleRefreshToken });
    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    const eventUpdate: any = {};
    if (serviceId) eventUpdate.summary = `Service #${serviceId} Availability`;
    if (startTime)
      eventUpdate.start = { dateTime: new Date(startTime).toISOString() };
    if (endTime)
      eventUpdate.end = { dateTime: new Date(endTime).toISOString() };

    await calendar.events.update({
      calendarId: "primary",
      eventId: availability.googleEventId,
      requestBody: {
        ...eventUpdate,
      },
    });

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
    const { id } = req.params;
    const user = req.user as UserJWT;
    const providerId = user.id as number;
    const role = user.role;

    const availability = await Availability.findOne({
      where: { id },
    });

    if (!availability)
      return next(new ApiError("Availability not found", 404));

    if (role !== "admin" && availability.providerId !== providerId) {
      return next(
        new ApiError("You are not authorized to delete this availability", 403)
      );
    }

    const provider = await User.findByPk(
      role === "admin" ? availability.providerId : providerId
    );

    if (!provider?.googleRefreshToken) {
      return next(
        new ApiError("Provider not connected with Google Calendar", 400)
      );
    }

    oauth2Client.setCredentials({ refresh_token: provider.googleRefreshToken });
    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    if (availability.googleEventId) {
      try {
        await calendar.events.delete({
          calendarId: "primary",
          eventId: availability.googleEventId,
        });
      } catch (error) {
        console.warn("Google event not found or already deleted");
      }
    }

    await availability.destroy();

    res.status(200).json({
      message: "Availability deleted successfully",
    });
  }
);
