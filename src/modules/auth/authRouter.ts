import express from "express";
import {
  approveProvider,
  declineProvider,
  getPendingProviders,
  googleSignIn,
  login,
  register,
} from "./authController";
import checkEmail from "../../../middleware/checkEmail";
import validate from "../../../middleware/validate";
import {
  approveProviderSchema,
  declineProviderSchema,
  loginSchema,
  registerSchema,
} from "./auth.validation";
import auth from "../../../middleware/auth";
import authGuard from "../../../middleware/authGuard";

const authRouter = express.Router();

authRouter.post("/register", validate(registerSchema), checkEmail, register);

authRouter.post("/login", validate(loginSchema), login);


authRouter.post("/loginWithGoogle", googleSignIn);

authRouter.get("/providers", auth, authGuard("admin"), getPendingProviders);

authRouter.post("/providers", validate(approveProviderSchema), auth, authGuard("admin"), approveProvider);

authRouter.delete("/providers/:id", validate(declineProviderSchema), auth, authGuard("admin"), declineProvider);


export default authRouter;
