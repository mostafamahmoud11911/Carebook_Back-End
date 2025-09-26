import { NextFunction, Request, Response } from "express";
import Service from "../../../db/models/service.model";
import { createError } from "../../../middleware/createError";
import ApiError from "../../../utils/ApiError";
import { destroyFromCloudinary } from "../../../utils/cloudinary";
import { User } from "../../../db/models";
import { handleEditImage, handleUploadImage } from "../../../utils/handleImg";
import ApiFeatures from "../../../utils/ApiFeatures";

export const getAllServices = createError(async (req, res) => {
  const apiFeatures = new ApiFeatures({ where: {} }, req.query)
    .searchQuery()
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
        attributes: ["id", "username", "email"],
      },
    ],
  });
  res.status(200).json({
    message: "Services fetched successfully",
    totalCount,
    page,
    services,
  });
});

export const getService = createError(
  async (req: Request, res: Response, next: NextFunction) => {
    const service = await Service.findByPk(req.params.id);
    if (!service) {
      return next(new ApiError("Service not found", 404));
    }


    


    res.status(200).json({ message: "Service fetched successfully", service });
  }
);

export const createService = createError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { attachmentUrl, attachmentUrls } = await handleUploadImage(req);

    const service = await Service.create({
      userId: req.user?.id as number,
      name: req.body.name,
      duration: req.body.duration,
      price: Number(req.body.price),
      offers: req.body.offers,
      ...(attachmentUrl ? { image: attachmentUrl } : {}),
      ...(attachmentUrls.length > 0 ? { images: attachmentUrls } : {}),
      rate: req.body.rate,
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

    await service.update({
      name: req.body.name ?? service.name,
      duration: req.body.duration ?? service.duration,
      price: req.body.price ?? service.price,
      offers: req.body.offers ?? service.offers,
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
