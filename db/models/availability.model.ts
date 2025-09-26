import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../db";
import User from "./user.model";
import Booking from "./booking.model";

interface AvailabilityAttributes {
  id?: number;
  providerId: number;
  serviceId: number;
  startTime: Date;
  endTime: Date;
  googleEventId?: string; // علشان تربط بالـ Calendar
  isBooked: boolean;
}

interface AvailabilityCreationAttributes
  extends Optional<AvailabilityAttributes, "id" | "googleEventId"> {}

class Availability
  extends Model<AvailabilityAttributes, AvailabilityCreationAttributes>
  implements AvailabilityAttributes
{
  public id!: number;
  public providerId!: number;
  public serviceId!: number;
  public startTime!: Date;
  public endTime!: Date;
  public googleEventId?: string;
  public isBooked!: boolean;
}

Availability.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    providerId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    serviceId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    startTime: { type: DataTypes.DATE, allowNull: false },
    endTime: { type: DataTypes.DATE, allowNull: false },
    googleEventId: { type: DataTypes.STRING, allowNull: true },
    isBooked: { type: DataTypes.BOOLEAN, defaultValue: false },
  },
  { sequelize, modelName: "availability", updatedAt: false }
);

// Availability - Booking
Availability.hasOne(Booking, { foreignKey: "availabilityId", as: "booking" });
Booking.belongsTo(Availability, { foreignKey: "availabilityId", as: "availability" });


export default Availability;
