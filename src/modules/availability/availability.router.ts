import express from "express";
import {
  addAvailability,
  deleteAvailability,
  getAvailabilities,
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

router.get("/", auth, authGuard("admin", "provider"), getAvailabilities);

router.post(
  "/",
  auth,
  validate(availabilitySchema),
  authGuard("admin", "provider"),
  addAvailability
);
router.put(
  "/:availabilityId",
  auth,
  validate(editAvailabilitySchema),
  authGuard("admin", "provider"),
  updateAvailability
);
router.delete(
  "/:id",
  auth,
  validate(deleteServiceSchema),
  authGuard("admin", "provider"),
  deleteAvailability
);

export default router;
