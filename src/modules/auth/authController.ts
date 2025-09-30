import { NextFunction, Request, Response } from "express";
import { createError } from "../../../middleware/createError";
import User from "../../../db/models/user.model";
import ApiError from "../../../utils/ApiError";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { google } from "googleapis";

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
  "postmessage"
);

export const googleSignIn = createError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { code, token, state } = req.body;

    console.log(code);

    // res.status(200).json({ message: "Google login successful", code });
    let payload: any = null;
    let refreshToken: string | undefined;

    if (code) {
      // 🟢 1. Exchange code for tokens (refresh_token + id_token)
      const { tokens } = await client.getToken(code);

      client.setCredentials(tokens);

      const ticket = await client.verifyIdToken({
        idToken: tokens.id_token!,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      payload = ticket.getPayload();
      refreshToken = tokens.refresh_token || undefined;
    } else if (token) {
      // 🟢 2. Verify ID token directly
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      payload = ticket.getPayload();
    } else {
      return next(new ApiError("Code or token is required", 400));
    }

    // 🟢 3. Validate payload
    if (!payload?.email || !payload.name) {
      return next(new ApiError("Invalid token", 400));
    }

    // 🟢 4. Find or create user
    const [user] = await User.findOrCreate({
      where: { email: payload.email, googleId: payload.sub },
      defaults: {
        email: payload.email,
        username: payload.name,
        googleId: payload.sub,
        googleRefreshToken: refreshToken ?? null,
        authProvider: "google",
        role: "user",
        isApproved: false,
        rolePending: (state as "provider") === "provider" ? "provider" : null,
      },
    });

    if (refreshToken && user.googleRefreshToken !== refreshToken) {
      user.googleRefreshToken = refreshToken;
      await user.save();
    }


    // 🟢 5. Generate JWT
    const jwtToken = user.generateAuthToken();

    res
      .cookie("token", jwtToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .status(200)
      .json({
        token: jwtToken,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          role: user.role
        },
      });
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
