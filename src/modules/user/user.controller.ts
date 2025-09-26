import { NextFunction, Request, Response } from "express";
import User from "../../../db/models/user.model";
import { createError } from "../../../middleware/createError";
import ApiError from "../../../utils/ApiError";

export const getAllUsers = createError(async (req: Request, res: Response) => {
  const users = await User.findAll();

  res.status(200).json(users);
});

export const getUser = createError(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return next(new ApiError("User not found", 404));
    }

    res.status(200).json({ message: "User fetched successfully", user });
  }
);

export const createUser = createError(async (req, res) => {
  const user = await User.create(req.body);

  res.status(201).json({ message: "User created successfully", user });
});

export const deleteUser = createError(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await User.destroy({ where: { id: req.params.id } });

    if (user === 0) {
      return next(new ApiError("User not found", 404));
    }

    res.status(200).json({ message: "User deleted successfully" });
  }
);

export const updateUser = createError(
  async (req: Request, res: Response, next: NextFunction) => {
    const [updated] = await User.update(req.body, {
      where: { id: req.params.id },
    });

    if (updated === 0) {
      return next(new ApiError("User not found", 404));
    }

    const user = await User.findByPk(req.params.id);

    res.status(200).json({ message: "User updated successfully", user });
  }
);
