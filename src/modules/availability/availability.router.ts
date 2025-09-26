import express from "express";
import {
  addAvailability,
  deleteAvailability,
  updateAvailability,
} from "./availability.controller";
import auth from "../../../middleware/auth";
import authGuard from "../../../middleware/authGuard";
import validate from "../../../middleware/validate";
import {
  availabilitySchema,
  editAvailabilitySchema,
} from "./availability.validation";
import { deleteServiceSchema } from "../services/servicesValidation";

const router = express.Router();

router.post(
  "/",
  auth,
  authGuard("admin", "provider"),
  validate(availabilitySchema),
  addAvailability
);
router.put(
  "/:availabilityId",
  auth,
  authGuard("admin", "provider"),
  validate(editAvailabilitySchema),
  updateAvailability
);
router.delete(
  "/:availabilityId",
  auth,
  authGuard("admin", "provider"),
  validate(deleteServiceSchema),
  deleteAvailability
);

export default router;
