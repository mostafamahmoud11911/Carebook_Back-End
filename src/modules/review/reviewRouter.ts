import express from "express";
import { createReview } from "./reviewController";
import auth from "../../../middleware/auth";
import authGuard from "../../../middleware/authGuard";

const reviewRouter = express.Router();

reviewRouter.post("/", auth, authGuard("user"), createReview);

export default reviewRouter;
