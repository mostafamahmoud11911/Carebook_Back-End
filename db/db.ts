import { Sequelize } from "sequelize";
import dotenv from "dotenv";
dotenv.config();




if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is missing");
}

const sequelize = new Sequelize(process.env.DATABASE_URL);

export default sequelize;
