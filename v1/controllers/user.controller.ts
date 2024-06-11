import { Request, Response } from "express";
import User from "../models/user.model";
import * as jwtHelper from "../../helpers/jwt.helper";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// [POST] /api/v1/users/register
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { fullName, email, password } = req.body;
    const existEmail = await User.findOne({
      email: email,
      deleted: false,
    });

    if (existEmail) {
      res.json({
        code: 200,
        message: "Email already exists",
      });
    }
    if (!password) {
      res.status(400).json({ message: "Password is required" });
      return;
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const record = new User({ fullName, email, password: hashedPassword });
    await record.save();

    res.status(200).json({
      user: record,
    });
  } catch (error) {
    console.error("Error during user registration:", error);
    res.status(500).json({ message: "Internal Server Error", error });
  }
};

// [POST] /api/v1/users/token
export const refreshAccessToken = async (
  req: Request,
  res: Response
): Promise<void> => {
  const refreshToken = req.headers.authorization?.split(" ")[1];
  if (!refreshToken) {
    res.status(401).json({ message: "Refresh Token is required" });
    return;
  }
  try {
    console.log(refreshToken);
    const payload = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET || ""
    );
    res.json(payload);
  } catch (error) {
    console.error("Error refreshing access token:", error);
    res.status(403).json({ message: "Invalid Refresh Token" });
  }
};

// [POST] /api/v1/users/login
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const user = await User.findOne({
      email: email,
      deleted: false,
    });
    if (!user) {
      res.status(404).json("Not valid email");
    }

    const validPassword = await bcrypt.compare(password, user?.password || "");
    if (!validPassword) {
      res.status(404).json("Incorrect password!");
    }

    if (user && validPassword) {
      const accessToken: string = jwtHelper.generateAccessToken(user.id);
      const refreshToken: string = jwtHelper.generateRefreshToken(user.id);
      const userObject = user.toObject();
      const { password, ...userNew } = userObject;

      res.status(200).json({
        user: userNew,
        accessToken: accessToken,
        refreshToken: refreshToken,
      });
    }
  } catch (error) {
    res.status(500).json(error);
  }
};
