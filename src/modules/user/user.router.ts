import express from "express";
import {
  createUser,
  deleteUser,
  getAllUsers,
  getUser,
  updateUser,
} from "./user.controller";
import auth from "../../../middleware/auth";
import checkEmail from "../../../middleware/checkEmail";
import authGuard from "../../../middleware/authGuard";
import validate from "../../../middleware/validate";
import {
  createUserSchema,
  deleteUserSchema,
  getUserSchema,
  updateUserSchema,
} from "./user.validation";

const userRouter = express.Router();

userRouter.get("/", auth, authGuard("admin", "provider"), getAllUsers);
userRouter.get(
  "/:id",
  validate(getUserSchema),
  auth,
  authGuard("admin"),
  getUser
);
userRouter.post(
  "/",
  validate(createUserSchema),
  auth,
  authGuard("admin"),
  checkEmail,
  createUser
);
userRouter.delete(
  "/:id",
  validate(deleteUserSchema),
  auth,
  authGuard("admin"),
  deleteUser
);
userRouter.put(
  "/:id",
  validate(updateUserSchema),
  auth,
  authGuard("admin"),
  updateUser
);

export default userRouter;
