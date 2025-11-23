import { NextFunction, Request, Response } from "express";
import { createError } from "../../../middleware/createError";
import { Service, User, UserWishlist } from "../../../db/models";
import ApiError from "../../../utils/ApiError";

export const getWishlist = createError(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await User.findByPk(req.user?.id, {
      include: [
        {
          model: Service,
          as: "wishlist",
          through: { attributes: [] },
        },
      ],
    });

    if (!user) {
      return next(new ApiError("User not found", 404));
    }

    res.status(200).json({ wishlists: user.wishlist });
  }
);

export const createWishlist = createError(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user?.id) {
      return next(new ApiError("Unauthorized", 401));
    }

    if (!req.body.serviceId) {
      return next(new ApiError("ServiceId is required", 400));
    }
    const [item, created] = await UserWishlist.findOrCreate({
      where: {
        userId: req.user?.id,
        serviceId: req.body.serviceId,
      },
    });

    if (!created) {
      return next(new ApiError("Service already in wishlist.", 403));
    }

    res.status(201).json({ message: "Service added in wishlist." });
  }
);

export const removeFromWishlist = createError(
  async (req: Request, res: Response, next: NextFunction) => {
    console.log(req.params.id);
    const deleted = await UserWishlist.destroy({
      where: {
        userId: req.user?.id,
        serviceId: Number(req.params.serviceId),
      },
    });

    if (!deleted) {
      res.status(404).json({ message: "Service not found in user's wishlist" });
    }

    res
      .status(200)
      .json({ message: "Service removed from wishlist successfully" });
  }
);
