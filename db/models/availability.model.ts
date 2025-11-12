import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../db";
import User from "./user.model";
import Booking from "./booking.model";
import Service from "./service.model";

interface AvailabilityAttributes {
  id?: number;
  providerId: number;
  serviceId: number;
  startTime: Date;
  endTime: Date;
  googleEventId?: string;
  isBooked: boolean;
}

interface AvailabilityCreationAttributes
  extends Optional<AvailabilityAttributes, "id" | "googleEventId"> { }

class Availability
  extends Model<AvailabilityAttributes, AvailabilityCreationAttributes>
  implements AvailabilityAttributes {
  public id!: number;
  public providerId!: number;
  public serviceId!: number;
  public startTime!: Date;
  public endTime!: Date;
  public googleEventId?: string;
  public isBooked!: boolean;

  public service?: Service;
  public provider?: User;
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
  { sequelize, modelName: "availability", tableName: "availabilities", updatedAt: false }
);

// Availability - Booking
Availability.hasOne(Booking, { foreignKey: "availabilityId", as: "booking", onDelete: "CASCADE", onUpdate: "CASCADE" });
Booking.belongsTo(Availability, { foreignKey: "availabilityId", as: "availability", onDelete: "CASCADE", onUpdate: "CASCADE" });


export default Availability;
