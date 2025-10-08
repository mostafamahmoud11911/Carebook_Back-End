import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../db";
import User from "./user.model";
import Availability from "./availability.model";
import Booking from "./booking.model";
import Review from "./review.model";

interface ServiceAttributes {
  id: number;
  name: string;
  duration: string;
  price: number;
  offers?: string;
  image?: string;
  images?: string[];
  rate?: number;
  userId: number;
}

interface ServiceCreationAttributes extends Optional<ServiceAttributes, "id"> {}

class Service
  extends Model<ServiceAttributes, ServiceCreationAttributes>
  implements ServiceAttributes
{
  public id!: number;
  public name!: string;
  public duration!: string;
  public price!: number;
  public offers?: string;
  public image?: string;
  public images?: string[];
  public rate?: number;
  public userId!: number;
}

Service.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    duration: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    price: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    offers: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    images: {
      type: DataTypes.JSON,
      allowNull: true,
      get() {
        const rawValue = this.getDataValue("images");
        if (!rawValue) return [];
        if (typeof rawValue === "string") {
          try {
            return JSON.parse(rawValue);
          } catch {
            return [];
          }
        }
        return rawValue;
      },
      set(value: any) {
        this.setDataValue("images", Array.isArray(value) ? value : []);
      },
    },
    rate: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        max: 5,
        min: 0,
      },
    },
    userId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: "Users",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
  },
  {
    sequelize,
    modelName: "Service",
    updatedAt: false,
  }
);



Service.hasMany(Availability, { foreignKey: "serviceId" });
Availability.belongsTo(Service, { foreignKey: "serviceId" });


// Service - Booking
Service.hasMany(Booking, { foreignKey: "serviceId", as: "bookings" });
Booking.belongsTo(Service, { foreignKey: "serviceId", as: "services" });



// review
Service.hasMany(Review, { foreignKey: "serviceId" });
Review.belongsTo(Service, { foreignKey: "serviceId" });


export default Service;
