import { Sequelize } from "sequelize";

const sequelize = new Sequelize("booking_system", "root", "", {
  host: "localhost",
  port: 4306,
  dialect: "mysql",
});

export default sequelize;
