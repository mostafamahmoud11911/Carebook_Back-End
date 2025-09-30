import express from "express";
import { getAdminDashboard, getProviderDashboard } from "./dashboard.controller";
import auth from "../../../middleware/auth";
import authGuard from "../../../middleware/authGuard";

const dashboardRouter = express.Router();


dashboardRouter.get("/", auth,authGuard("admin"), getAdminDashboard);
dashboardRouter.get("/", auth,authGuard("provider"), getProviderDashboard);



export default dashboardRouter;
