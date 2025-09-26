import { DataTypes, Model } from "sequelize";
import sequelize from "../db";

class Booking extends Model {
  public id!: number;
  public clientId!: number;
  public providerId!: number;
  public serviceId!: number;
  public availabilityId!: number;
  public status!: string; // confirmed | cancelled
  public startTime!: Date;
  public endTime!: Date;
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
    serviceId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    availabilityId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    status: {
      type: DataTypes.ENUM("confirmed", "cancelled"),
      defaultValue: "confirmed",
    },
    startTime: { type: DataTypes.DATE, allowNull: true }, // في حالة تعديل الموعد
    endTime: { type: DataTypes.DATE, allowNull: true },
  },
  { sequelize, modelName: "Booking" }
);

export default Booking;
