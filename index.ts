import express, { NextFunction, Request, Response } from "express";
import morgan from "morgan";
import cors from "cors";
import dotenv from "dotenv";
import ApiError from "./utils/ApiError";
import sequelize from "./db/db";
import bootstrap from "./src/modules/bootstrap";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import passport from "passport";
import "./utils/passportSetUp";
import { googleSignIn } from "./src/modules/auth/authController";

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
app.use(cookieParser());
app.use(passport.initialize());

app.get("/google", (req, res, next) => {
  const state = req.query.state || "user"; // user أو provider
  passport.authenticate("google", {
    scope: ["profile", "email"],
    accessType: "offline",
    prompt: "consent",
    state,
  } as any)(req, res, next);
});

app.get("/fail", (req, res) => {
  return res.json({ message: "Fail to login" });
});

app.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "/fail" }),
  googleSignIn
);

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
