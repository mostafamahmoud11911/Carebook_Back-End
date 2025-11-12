import express from "express";
import { createReview, deleteReview, getServiceReview, getServiceReviews } from "./reviewController";
import auth from "../../../middleware/auth";
import authGuard from "../../../middleware/authGuard";
import validate from "../../../middleware/validate";
import { addReviewValidation, deleteReviewValidation, getReviewValidation } from "./reviewValidation";

const reviewRouter = express.Router();

reviewRouter.post("/", validate(addReviewValidation), auth, authGuard("user"), createReview);
reviewRouter.get("/all/:id", getServiceReviews)
reviewRouter.get("/:id", validate(getReviewValidation), auth, authGuard("user"), getServiceReview);
reviewRouter.delete("/:id", validate(deleteReviewValidation), auth, authGuard("user", "provider", "admin"), deleteReview)


export default reviewRouter;
