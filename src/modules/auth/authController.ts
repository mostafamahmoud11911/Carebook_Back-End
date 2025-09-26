import { NextFunction, Request, Response } from "express";
import { createError } from "../../../middleware/createError";
import User from "../../../db/models/user.model";
import ApiError from "../../../utils/ApiError";
import { OAuth2Client, TokenPayload } from "google-auth-library";
import dotenv from "dotenv";

dotenv.config();

export const register = createError(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await User.create({
      authProvider: "local",
      role: "user",
      ...req.body,
    });
    res.status(201).json(user);
  }
);

export const login = createError(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await User.findOne({ where: { email: req.body.email } });

    if (!user || !(await user.comparePassword(req.body.password))) {
      return next(new ApiError("Invalid email or password", 400));
    }

    const token = user.generateAuthToken();

    res
      .cookie("token", token, {
        httpOnly: true,
        secure: false,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .status(200)
      .json({
        message: "Successfully login",
        token,
        user: {
          username: user.username,
          email: user.email,
          role: user.role,
          isApproved: user.isApproved,
        },
      });
  }
);

const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

export const googleSignIn = createError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { code, state } = req.query; // Google هترجع بالكود هنا

    if (!code) {
      return next(new ApiError("Missing authorization code", 400));
    }

    try {
      // 🟢 بدّل الكود بتوكنات
      const { tokens } = await client.getToken(code as string);
      if (!tokens.id_token) {
        return next(new ApiError("No id_token returned from Google", 400));
      }

      // 🟢 تحقق من التوكن
      const ticket = await client.verifyIdToken({
        idToken: tokens.id_token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      if (!payload?.email || !payload.sub || !payload.name) {
        return next(new ApiError("Invalid google token", 500));
      }

      // 🟢 اعمل create/update user
      const [user] = await User.findOrCreate({
        where: { googleId: payload.sub },
        defaults: {
          email: payload.email,
          username: payload.name,
          googleId: payload.sub,
          authProvider: "google",
          role: "user",
          isApproved: false,
          googleRefreshToken: tokens.refresh_token || undefined,
        },
      });

      // 🟢 خزّن refresh_token لو طلع جديد
      if (tokens.refresh_token && user.googleRefreshToken !== tokens.refresh_token) {
        user.googleRefreshToken = tokens.refresh_token;
        await user.save();
      }

      // 🟢 ولّد JWT
      const jwtToken = user.generateAuthToken();

      // 🟢 رجّع response للفرونت
      res
        .cookie("token", jwtToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          maxAge: 7 * 24 * 60 * 60 * 1000,
        })
        .status(200)
        .json({
          token: jwtToken,
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            isApproved: user.isApproved,
          },
        });
    } catch (err) {
      next(err);
    }
  }
);

export const getPendingProviders = createError(
  async (req: Request, res: Response, next: NextFunction) => {
    const pendingUsers = await User.findAll({
      where: { rolePending: "provider", isApproved: false },
      attributes: ["id", "username", "email", "rolePending", "isApproved"],
    });

    res.status(200).json({
      message: "Pending provider requests fetched successfully",
      pendingUsers,
    });
  }
);

export const approveProvider = createError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.params;

    const user = await User.findByPk(userId);
    if (!user) return next(new ApiError("User not found", 404));
    if (user.rolePending !== "provider")
      return next(new ApiError("No pending provider request", 400));

    user.role = "provider";
    user.rolePending = null;
    user.isApproved = true;
    await user.save();

    res.status(200).json({
      message: "Provider request approved successfully",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        isApproved: user.isApproved,
      },
    });
  }
);
