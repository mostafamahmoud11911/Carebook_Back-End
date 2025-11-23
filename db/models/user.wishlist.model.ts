import sequelize from "../db";
import { DataTypes, Model } from "sequelize";

class UserWishlist extends Model {}

UserWishlist.init(
  {
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
    serviceId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: "Services",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
  },
  {
    sequelize,
    modelName: "UserWishlist",
    tableName:"userwishlists",
    updatedAt: false,
  }
);
export default UserWishlist;
