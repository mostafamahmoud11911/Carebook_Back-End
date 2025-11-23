import { DataTypes, Model } from "sequelize";
import sequelize from "../db";
import User from "./user.model";

class Booking extends Model {
  public id!: number;
  public clientId!: number;
  public providerId!: number;
  public serviceId!: number;
  public availabilityId!: number;
  public status!: string;
  public startTime!: Date;
  public endTime!: Date;


  public user?: User
}

Booking.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    clientId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    providerId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    serviceId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: { model: "Services", key: "id" },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    availabilityId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    status: {
      type: DataTypes.ENUM("confirmed", "cancelled"),
      defaultValue: "confirmed",
    },
    startTime: { type: DataTypes.DATE, allowNull: true },
    endTime: { type: DataTypes.DATE, allowNull: true },
  },
  { sequelize, modelName: "Booking", tableName: "bookings", updatedAt: false }
);

export default Booking;
