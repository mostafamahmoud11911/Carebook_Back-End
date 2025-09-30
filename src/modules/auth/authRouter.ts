import express from "express";
import {
  getPendingProviders,
  googleSignIn,
  login,
  register,
} from "./authController";
import checkEmail from "../../../middleware/checkEmail";
import validate from "../../../middleware/validate";
import {
  loginSchema,
  registerSchema,
} from "../../../validation/auth.validation";
import auth from "../../../middleware/auth";
import authGuard from "../../../middleware/authGuard";

const authRouter = express.Router();

authRouter.post("/register", validate(registerSchema), checkEmail, register);

authRouter.post("/login", validate(loginSchema), login);

authRouter.post("/loginWithGoogle", googleSignIn);

authRouter.get("/providers", auth, getPendingProviders);

export default authRouter;
