import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Booking from "./booking.model";
import Service from "./service.model";
import Availability from "./availability.model";
import Review from "./review.model";

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
  googleRefreshToken?: string | null;
}

interface UserCreationAttributes
  extends Optional<
    UserAttributes,
    | "id"
    | "password"
    | "rolePending"
    | "isApproved"
    | "googleId"
    | "googleRefreshToken"
    | "wishlist"
  > { }

class User
  extends Model<UserAttributes, UserCreationAttributes>
  implements UserAttributes {
  public id!: number;
  public username!: string;
  public email!: string;
  public password?: string;
  public role!: Role;
  public authProvider!: AuthProvider;
  public googleId?: string;
  public rolePending?: "provider" | null;
  public isApproved?: boolean;
  public googleRefreshToken?: string | null;
  public wishlist!: any[];

  // generate token when user signin
  public generateAuthToken(): string {
    return jwt.sign(
      { id: this.id, role: this.role },
      process.env.JWT_SECRET as string
    );
  }

  // compare password before login
  public async comparePassword(password: string): Promise<boolean> {
    if (!this.password) return false;
    return bcrypt.compare(password, this.password);
  }
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
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
    isApproved: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    googleRefreshToken: { type: DataTypes.STRING, allowNull: true },
  },
  {
    sequelize,
    updatedAt: false,
    tableName:"users",
    modelName: "User",
    hooks: {
      // hash password before create user
      beforeCreate: async (user) => {
        if (user.authProvider === "local" && user.password) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
      // hash password before update
      beforeUpdate: async (user) => {
        if (user.authProvider === "local" && user.password) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
    },
  }
);


User.hasMany(Service, { foreignKey: "providerId", as: "providerService", onDelete: "CASCADE", onUpdate: "CASCADE" });
Service.belongsTo(User, { foreignKey: "providerId", as: "provider", onDelete: "CASCADE", onUpdate: "CASCADE" });

// User (client) - Booking
User.hasMany(Booking, { foreignKey: "clientId", as: "clientBookings", onDelete: "CASCADE", onUpdate: "CASCADE" });
Booking.belongsTo(User, { foreignKey: "clientId", as: "client", onDelete: "CASCADE", onUpdate: "CASCADE" });

// User (provider) - Booking
User.hasMany(Booking, { foreignKey: "providerId", as: "providerBookings", onDelete: "CASCADE", onUpdate: "CASCADE" });
Booking.belongsTo(User, { foreignKey: "providerId", as: "provider", onDelete: "CASCADE", onUpdate: "CASCADE" });

// User (provider) - Availability
User.hasMany(Availability, { foreignKey: "providerId", as: "availabilities", onDelete: "CASCADE", onUpdate: "CASCADE" });
Availability.belongsTo(User, { foreignKey: "providerId", as: "provider", onDelete: "CASCADE", onUpdate: "CASCADE" });

// Review
User.hasMany(Review, { foreignKey: "userId", as: "reviews", onDelete: "CASCADE", onUpdate: "CASCADE" });
Review.belongsTo(User, { foreignKey: "userId", as: "user", onDelete: "CASCADE", onUpdate: "CASCADE" });

export default User;
