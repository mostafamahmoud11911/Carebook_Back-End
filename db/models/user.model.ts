import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Booking from "./booking.model";
import Service from "./service.model";
import Availability from "./availability.model";

type Role = "admin" | "user" | "provider";
type AuthProvider = "local" | "google";



interface UserAttributes {
  id?: number;
  username: string;
  email: string;
  password?: string;
  role: Role;
  authProvider: AuthProvider;
  googleId?: string;
  rolePending?: "provider" | null;
  isApproved?: boolean;
  wishlist?: any[];
  googleRefreshToken?: string;
}

interface UserCreationAttributes extends Optional<UserAttributes, "id" | "password" | "rolePending" | "isApproved" | "googleId" | "googleRefreshToken"> {}

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: number;
  public username!: string;
  public email!: string;
  public password?: string;
  public role!: Role;
  public authProvider!: AuthProvider;
  public googleId?: string;
  public rolePending?: "provider" | null;
  public isApproved?: boolean;
  public googleRefreshToken?: string;
  public wishlist!: any[];

  public generateAuthToken(): string {
    return jwt.sign({ id: this.id, role: this.role }, process.env.JWT_SECRET as string);
  }

  public async comparePassword(password: string): Promise<boolean> {
    if (!this.password) return false;
    return bcrypt.compare(password, this.password);
  }
}

User.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    username: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: true },
    role: {
      type: DataTypes.ENUM("admin", "user", "provider"),
      allowNull: false,
      defaultValue: "user",
      validate: { isIn: [["admin", "user", "provider"]] },
    },
    authProvider: {
      type: DataTypes.ENUM("local", "google"),
      allowNull: false,
      defaultValue: "local",
    },
    googleId: { type: DataTypes.STRING, allowNull: true, unique: true },
    rolePending: { type: DataTypes.ENUM("provider"), allowNull: true },
    isApproved: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    googleRefreshToken: { type: DataTypes.STRING, allowNull: true },
  },
  {
    sequelize,
    updatedAt: false,
    hooks: {
      beforeCreate: async (user) => {
        if (user.authProvider === "local" && user.password) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
      beforeUpdate: async (user) => {
        if (user.authProvider === "local" && user.password) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
    },
  }
);

User.hasMany(Service, { foreignKey: "userId" });
Service.belongsTo(User, { foreignKey: "userId" });


// User (client) - Booking
User.hasMany(Booking, { foreignKey: "clientId", as: "clientBookings" });
Booking.belongsTo(User, { foreignKey: "clientId", as: "client" });


// User (provider) - Booking
User.hasMany(Booking, { foreignKey: "providerId", as: "providerBookings" });
Booking.belongsTo(User, { foreignKey: "providerId", as: "provider" });


// User (provider) - Availability
User.hasMany(Availability, { foreignKey: "providerId", as: "availabilities" });
Availability.belongsTo(User, { foreignKey: "providerId", as: "provider" });



export default User;
