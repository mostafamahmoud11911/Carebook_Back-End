import { NextFunction, Request, Response } from "express";
import Service from "../../../db/models/service.model";
import { createError } from "../../../middleware/createError";
import ApiError from "../../../utils/ApiError";
import { destroyFromCloudinary } from "../../../utils/cloudinary";
import { User } from "../../../db/models";
import { handleEditImage, handleUploadImage } from "../../../utils/handleImg";
import ApiFeatures from "../../../utils/ApiFeatures";
import { UserJWT } from "../../../types";
import Review from "../../../db/models/review.model";
import Availability from "../../../db/models/availability.model";

export const getAllServices = createError(async (req, res) => {
  const apiFeatures = new ApiFeatures({ where: {} }, req.query)
    .searchQuery("name")
    .filterQuery();

  const totalCount = await Service.count();

  const page = Number(req.query.page) || 1;
  const limit = Math.max(Number(req.query.limit) || 10, 1);
  const skip = (page - 1) * limit;

  const services = await Service.findAll({
    ...apiFeatures.sequelizeQuery,
    offset: skip,
    limit,
    include: [
      {
        model: User,
        as: "provider",
        attributes: ["id", "username", "email"],
      },
      {
        model: Review,
        as: "reviews",
        attributes: ["comment", "rating"],
      }
    ],
  });
  res.status(200).json({
    totalCount,
    page,
    services,
  });
});

export const getService = createError(
  async (req: Request, res: Response, next: NextFunction) => {
    const service = await Service.findByPk(req.params.id, { include: [{ model: Review, as: "reviews", attributes: ["comment", "rating", "userId"] }, { model: Availability, as: "availabilities" }, { model: User, as: "provider", attributes: ["username"] }] });
    if (!service) {
      return next(new ApiError("Service not found", 404));
    }
    res.status(200).json({ message: "Service fetched successfully", service });
  }
);

export const createService = createError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { attachmentUrl, attachmentUrls } = await handleUploadImage(req);


    const providerId = (req.user as UserJWT).role === "provider"
      ? (req.user as UserJWT).id : req.body.providerId;


    let offers = req.body.offers;

    if (typeof offers === "string") {
      offers = offers.split(",").map((item) => item.trim());
    }


    const service = await Service.create({
      providerId,
      name: req.body.name,
      duration: req.body.duration,
      price: Number(req.body.price),
      offers,
      ...(attachmentUrl ? { image: attachmentUrl } : {}),
      ...(attachmentUrls.length > 0 ? { images: attachmentUrls } : {}),
    });

    res.status(201).json({ message: "Service created successfully", service });
  }
);

export const updateService = createError(
  async (req: Request, res: Response, next: NextFunction) => {
    const service = await Service.findByPk(req.params.id);
    if (!service) {
      return next(new ApiError("Service not found", 404));
    }

    const { attachmentUrl, attachmentUrls } = await handleEditImage(
      req,
      service
    );
    let offersArray: string[] = [];

    if (req.body.offers) {
      if (typeof req.body.offers === "string") {
        offersArray = req.body.offers
          .split(",")
          .map((offer: string) => offer.trim())
          .filter((offer: string) => offer.length > 0);
      } else if (Array.isArray(req.body.offers)) {
        offersArray = req.body.offers;
      }
    }

    await service.update({
      name: req.body.name ?? service.name,
      duration: req.body.duration ?? service.duration,
      price: req.body.price ?? service.price,
      offers: offersArray ?? service.offers,
      image: attachmentUrl,
      ...(req.files && (req.files as any)["images"]?.length > 0
        ? { images: attachmentUrls }
        : { images: service.images }),
      rate: req.body.rate ?? service.rate,
    });

    res.status(200).json({ message: "Service updated successfully", service });
  }
);

export const deleteService = createError(
  async (req: Request, res: Response, next: NextFunction) => {
    const service = await Service.findByPk(req.params.id);
    if (!service) {
      return next(new ApiError("Service not found", 404));
    }

    if (service.image) {
      await destroyFromCloudinary(service.image);
    }
    let oldImages: string[] = [];

    if (service.images) {
      if (Array.isArray(service.images)) {
        oldImages = service.images;
      } else if (typeof service.images === "string") {
        try {
          oldImages = JSON.parse(service.images);
        } catch {
          oldImages = [];
        }
      }
    }

    if (oldImages.length) {
      await Promise.all(
        oldImages.map(async (img) => {
          return destroyFromCloudinary(img);
        })
      );
    }

    await service.destroy();

    res.status(200).json({ message: "Service deleted successfully" });
  }
);
