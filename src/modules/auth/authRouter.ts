import express from "express";
import { googleSignIn, login, register } from "./authController";
import checkEmail from "../../../middleware/checkEmail";
import validate from "../../../middleware/validate";
import {
  loginSchema,
  registerSchema,
} from "../../../validation/auth.validation";

const authRouter = express.Router();

authRouter.post("/register", validate(registerSchema), checkEmail, register);

authRouter.post("/login", validate(loginSchema), login);


authRouter.get("/google-signin", googleSignIn);

export default authRouter;
