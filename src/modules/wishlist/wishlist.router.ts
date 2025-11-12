import express from "express";
import {
  createWishlist,
  getWishlist,
  removeFromWishlist,
} from "./wishlist.controller";
import auth from "../../../middleware/auth";
import authGuard from "../../../middleware/authGuard";
import validate from "../../../middleware/validate";
import { wishlistSchema } from "./wishlist.validation";

const wishlistRouter = express.Router();

wishlistRouter.get("/", auth, authGuard("user"), getWishlist);
wishlistRouter.post(
  "/",
  validate(wishlistSchema),
  auth,
  authGuard("user"),
  createWishlist
);
wishlistRouter.delete(
  "/:serviceId",
  validate(wishlistSchema),
  auth,
  authGuard("user"),
  removeFromWishlist
);

export default wishlistRouter;
