import express from "express";
import { getDashboard } from "./status.controller";
import auth from "../../../middleware/auth";
import authGuard from "../../../middleware/authGuard";

const dashboardRouter = express.Router();


dashboardRouter.get("/", auth, authGuard("admin", "provider"), getDashboard);



export default dashboardRouter;
