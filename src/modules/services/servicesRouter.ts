import express from "express";
import auth from "../../../middleware/auth";
import {
  createService,
  deleteService,
  getAllServices,
  getService,
  updateService,
} from "./servicesController";
import authGuard from "../../../middleware/authGuard";
import { uploadMax } from "../../../middleware/uploadImage";
import validate from "../../../middleware/validate";
import {
  createServiceSchema,
  deleteServiceSchema,
  getServiceSchema,
  updateServiceSchema,
} from "./servicesValidation";

const servicesRouter = express.Router();

servicesRouter.get(
  "/",
  getAllServices
);
servicesRouter.get(
  "/:id",
  validate(getServiceSchema),
  getService
);
servicesRouter.post(
  "/",
  uploadMax([
    { name: "image", maxCount: 1 },
    { name: "images", maxCount: 5 },
  ]),
  validate(createServiceSchema),
  auth,
  authGuard("admin", "provider"),
  createService
);
servicesRouter.delete(
  "/:id",
  validate(deleteServiceSchema),
  auth,
  authGuard("admin", "provider"),
  deleteService
);
servicesRouter.put(
  "/:id",
  uploadMax([
    { name: "image", maxCount: 1 },
    { name: "images", maxCount: 5 },
  ]),
  validate(updateServiceSchema),
  auth,
  authGuard("admin", "provider"),
  updateService
);

export default servicesRouter;
