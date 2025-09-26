import express, { NextFunction, Request, Response } from "express";
import morgan from "morgan";
import cors from "cors";
import dotenv from "dotenv";
import ApiError from "./utils/ApiError";
import sequelize from "./db/db";
import bootstrap from "./src/modules/bootstrap";
import helmet from "helmet";
import cookieParser from "cookie-parser";

dotenv.config();
interface customError extends Error {
  status?: number;
}

const app = express();
const port = process.env.PORT || 8080;

app.use(morgan("dev"));
app.use(helmet());
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.JWT_SECRET as string));

bootstrap(app);

app.use((req, res, next) => {
  next(new ApiError("Route Not Found", 404));
});

app.use((err: customError, req: Request, res: Response, next: NextFunction) => {
  res.json({
    message: err.message,
    status: err.status || 500,
  });
});

async function startServer() {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: false });
    app.listen(port, () =>
      console.log(`Example app listening on port ${port}!`)
    );
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
}
startServer();
