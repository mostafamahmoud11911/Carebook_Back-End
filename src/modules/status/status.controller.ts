import { NextFunction, Request, Response } from "express";
import { createError } from "../../../middleware/createError";
import Booking from "../../../db/models/booking.model";
import { col, fn, literal, Op } from "sequelize";
import { Service, User } from "../../../db/models";

export const getAdminDashboard = createError(
  async (req: Request, res: Response, next: NextFunction) => {
    const servicesCount = await Service.count();


    const startOfMonth = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1
    );
    const endOfMonth = new Date(
      new Date().getFullYear(),
      new Date().getMonth() + 1,
      0
    );

    const popularServices = await Booking.findAll({
      attributes: ["serviceId", [fn("COUNT", col("Booking.id")), "bookingCount"]],
      where: {
        createdAt: {
          [Op.between]: [startOfMonth, endOfMonth],
        },
      },
      group: ["serviceId"],
      order: [[literal("bookingCount"), "DESC"]],
      include: [
        {
          model: Service,
          as:"services",
          attributes: ["id", "name", "price"],
        },
      ],
      limit: 5,
    });

    const bookingsTrend = await Booking.findAll({
      attributes: [
        [fn("DATE", col("createdAt")), "date"],
        [fn("COUNT", col("Booking.id")), "count"],
      ],
      group: [fn("DATE", col("createdAt"))],
      order: [[literal("date"), "ASC"]],
      limit: 7,
    });

    const bookingsCount = await Booking.count();

    const usersCount = await User.findAll({
      attributes: ["role", [fn("COUNT", col("User.id")), "count"]],
      group: ["role"],
    });

    res.status(200).json({
      services: servicesCount,
      popularServices,
      bookingsTrend,
      bookings: bookingsCount,
      users: usersCount,
    });
  }
);

export const getProviderDashboard = createError(
  async (req: Request, res: Response, next: NextFunction) => {
    const providerId = req.user?.id;

    const servicesCount = await Service.count({
      where: { userId: providerId },
    });

    const providerServices = await Service.findAll({
      where: { userId: providerId },
    });

    const serviceIds = providerServices.map((service) => service.id);

    const bookingsService = await Booking.findAll({
      attributes: ["serviceId", [fn("COUNT", col("id")), "bookingCount"]],
      where: {
        serviceId: { [Op.in]: serviceIds },
      },
      group: ["serviceId"],
      include: [
        {
          model: Service,
          as: "services",
          attributes: ["id", "name"],
        },
      ],
      order: [[fn("COUNT", col("id")), "DESC"]],
    });





    res.status(200).json({
      services: servicesCount,
      bookings: bookingsService,
    });
  }
);
