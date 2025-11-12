import { NextFunction, Request, Response } from "express";
import { createError } from "../../../middleware/createError";
import Booking from "../../../db/models/booking.model";
import { col, fn, literal, Op } from "sequelize";
import { Service, User } from "../../../db/models";


export const getDashboard = createError(
  async (req: Request, res: Response, next: NextFunction) => {
    const servicesCount = await Service.count();

    const monthsCount = 6;
    const today = new Date();
    const months: string[] = [];
    for (let i = monthsCount - 1; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      months.push(`${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}`);
    }

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const popularServices = await Booking.findAll({
      attributes: ["serviceId", [fn("COUNT", col("Booking.id")), "bookingCount"]],
      where: { createdAt: { [Op.between]: [startOfMonth, endOfMonth] } },
      include: [{ model: Service, as: "service", attributes: ["id", "name", "image", "price"] }],
      group: ["serviceId"],
      order: [[literal("bookingCount"), "DESC"]],
      limit: 5,
    });

    const lastMonthBookingsRaw = await Booking.findAll({
      attributes: [
        [fn("COUNT", col("Booking.id")), "totalBookings"],
        [fn("SUM", col("service.price")), "totalRevenue"],
        [fn("AVG", col("service.price")), "averageBookingValue"],
        [fn("DATE_FORMAT", col("Booking.createdAt"), "%Y-%m"), "month"],
      ],
      include: [{ model: Service, as: "service", attributes: [] }],
      group: [fn("DATE_FORMAT", col("Booking.createdAt"), "%Y-%m")],
    });

    const lastMonthMap: Record<string, any> = {};
    lastMonthBookingsRaw.forEach((b: any) => {
      lastMonthMap[b.getDataValue("month")] = {
        month: b.getDataValue("month"),
        totalBookings: Number(b.getDataValue("totalBookings")),
        totalRevenue: Number(b.getDataValue("totalRevenue") || 0),
        averageBookingValue: Number(b.getDataValue("averageBookingValue") || 0),
      };
    });

    const lastMonth = months.map((m) => lastMonthMap[m] || {
      month: m,
      totalBookings: 0,
      totalRevenue: 0,
      averageBookingValue: 0,
    });

    const bookingsTrendRaw = await Booking.findAll({
      attributes: [
        [fn("DATE_FORMAT", col("createdAt"), "%Y-%m"), "month"],
        [fn("COUNT", col("id")), "count"],
      ],
      group: [fn("DATE_FORMAT", col("createdAt"), "%Y-%m")],
      order: [[literal("month"), "ASC"]],
    });

    const bookingsTrendMap: Record<string, any> = {};
    bookingsTrendRaw.forEach((b: any) => {
      bookingsTrendMap[b.getDataValue("month")] = {
        month: b.getDataValue("month"),
        count: Number(b.getDataValue("count")),
      };
    });

    const bookingsTrend = months.map((m) => bookingsTrendMap[m] || { month: m, count: 0 });

    const bookingsCount = await Booking.count();

    const usersCount = await User.findAll({
      attributes: ["role", [fn("COUNT", col("User.id")), "count"]],
      group: ["role"],
    });

    res.status(200).json({
      services: servicesCount,
      popularServices,
      lastMonth,
      bookingsTrend,
      bookings: bookingsCount,
      users: usersCount,
    });
  }
);


