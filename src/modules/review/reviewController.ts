import { NextFunction, Request, Response } from "express";
import { createError } from "../../../middleware/createError";
import Review from "../../../db/models/review.model";
import ApiError from "../../../utils/ApiError";
import { User } from "../../../db/models";

export const createReview = createError(
  async (req: Request, res: Response, next: NextFunction) => {
    const review = await Review.create({
      ...req.body,
      userId: req.user?.id,
      serviceId: req.body.serviceId,
    });
    res.status(201).json({ message: "Review created successfully", review });
  }
);

export const getServiceReview = createError(
  async (req: Request, res: Response, next: NextFunction) => {
    const reviews = await Review.findAll({
      where: { serviceId: req.params.id, userId: req.user?.id },
      include: [{ model: User, as: "user", attributes: ["username", "createdAt"] }]
    });
    res.status(200).json({ message: "Reviews fetched successfully", reviews });
  }
);


export const getServiceReviews = createError(
  async (req: Request, res: Response, next: NextFunction) => {
    const reviews = await Review.findAll({
      where: { serviceId: req.params.id },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["username", "createdAt"]
        }
      ],
      order: [["createdAt", "DESC"]]
    });

    res.status(200).json({
      message: "Reviews fetched successfully",
      reviews
    });
  }
);


export const deleteReview = createError(
  async (req: Request, res: Response, next: NextFunction) => {
    const review = await Review.destroy({
      where: { id: req.params.id, userId: req.user?.id },
    });
    if (review === 0) {
      return next(new ApiError("Review not found", 404));
    }
    res.status(200).json({ message: "Review deleted successfully" });
  }
);

// export const updateReview = createError(
//   async (req: Request, res: Response, next: NextFunction) => {
//     const [updated] = await Review.update(req.body, {
//       where: { id: req.params.id, userId: req.user?.id },
//     });
//     if (updated === 0) {
//       return next(new ApiError("User not found", 404));
//     }

//     const review = await Review.findByPk(req.params.id);
//     res.status(200).json({ message: "Review updated successfully", review });
//   }
// );
