import { DataTypes, Model } from "sequelize";
import sequelize from "../db";

interface ReviewAttributes {
    id: number;
    userId: number;
    serviceId: number;
    rating: number;
    comment: string;
}

class Review extends Model<ReviewAttributes> implements ReviewAttributes {
  public id!: number;
  public userId!: number;
  public serviceId!: number;
  public rating!: number;
  public comment!: string;
}

Review.init({
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
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
    rating: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            max: 5,
            min: 0,
        },
    },
    comment: {
        type: DataTypes.TEXT('long'),
        allowNull: false,
    },
}, {
    sequelize,
    modelName: "Review",
    tableName:"reviews",
    updatedAt: false
});




export default Review;