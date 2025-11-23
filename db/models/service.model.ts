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
  offers?: string[];
  image?: string;
  images?: string[];
  rate?: number;
  providerId: number;
}

interface ServiceCreationAttributes extends Optional<ServiceAttributes, "id"> { }

class Service
  extends Model<ServiceAttributes, ServiceCreationAttributes>
  implements ServiceAttributes {
  public id!: number;
  public name!: string;
  public duration!: string;
  public price!: number;
  public offers?: string[];
  public image?: string;
  public images?: string[];
  public rate?: number;
  public providerId!: number;
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
      type: DataTypes.JSON,
      allowNull: true,
      get() {
        const rawValue = this.getDataValue("offers");
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
        this.setDataValue("offers", Array.isArray(value) ? value : []);
      },
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
    providerId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
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
    tableName: "services",
    updatedAt: false,
  }
);


// Service - Availability
Service.hasMany(Availability, { foreignKey: "serviceId", as: "availabilities", onDelete: "CASCADE", onUpdate: "CASCADE" });
Availability.belongsTo(Service, { foreignKey: "serviceId", as: "service", onDelete: "CASCADE", onUpdate: "CASCADE" });


// Service - Booking
Service.hasMany(Booking, { foreignKey: "serviceId", as: "bookings", onDelete: "CASCADE", onUpdate: "CASCADE" });
Booking.belongsTo(Service, { foreignKey: "serviceId", as: "service", onDelete: "CASCADE", onUpdate: "CASCADE" });



// Service - Review
Service.hasMany(Review, { foreignKey: "serviceId", as: "reviews", onDelete: "CASCADE", onUpdate: "CASCADE" });
Review.belongsTo(Service, { foreignKey: "serviceId", as: "review", onDelete: "CASCADE", onUpdate: "CASCADE" });


export default Service;
