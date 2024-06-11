import { Request, Response } from "express";
import User from "../models/user.model";
import * as jwtHelper from "../../helpers/jwt.helper";
import bcrypt from "bcrypt";
import jwt, { JwtPayload, VerifyErrors } from "jsonwebtoken";
import RefreshToken from "../models/refresh-token.model";

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

// [POST] /api/v1/users/refresh-token
export const refreshToken = async (
  req: Request,
  res: Response
): Promise<void> => {
  const token = req.cookies.refreshToken;
  if (!token) {
    res.status(401).json({ message: "You're not authenticated" });
    return;
  }
  try {
    jwt.verify(
      token,
      process.env.REFRESH_TOKEN_SECRET || "",
      async (
        error: VerifyErrors | null,
        decoded: JwtPayload | undefined | string
      ) => {
        if (error) {
          res.status(403).json("User not authorized");
          return;
        }
        if (typeof decoded === "string" || decoded === undefined) {
          throw new Error("Invalid decoded data");
        }

        const storedToken = await RefreshToken.findOne({
          userId: decoded.userId,
          refreshToken: token,
        });

        if (!storedToken) {
          res.status(403).json({ message: "Invalid Refresh Token" });
          return;
        }
        const newAccessToken = jwtHelper.generateAccessToken(decoded.userId);
        const newRefreshToken = jwtHelper.generateRefreshToken(decoded.userId);
        const newRecord = new RefreshToken({
          userId: decoded.userId,
          refreshToken: newRefreshToken,
        });
        await newRecord.save();

        await RefreshToken.deleteMany({
          userId: decoded.userId,
          refreshToken: { $ne: newRefreshToken },
        });
        res.cookie("refreshToken", newRefreshToken, {
          httpOnly: true,
          secure: false,
          path: "/",
          sameSite: "strict",
        });
        res.status(200).json({ accessToken: newAccessToken });
      }
    );
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
      return;
    }

    const validPassword = await bcrypt.compare(password, user?.password || "");
    if (!validPassword) {
      res.status(404).json("Incorrect password!");
      return;
    }

    if (user && validPassword) {
      const accessToken: string = jwtHelper.generateAccessToken(user.id);
      const refreshToken: string = jwtHelper.generateRefreshToken(user.id);
      const record = new RefreshToken({
        userId: user.id,
        refreshToken: refreshToken,
      });
      await record.save();
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: false,
        path: "/",
        sameSite: "strict",
      });
      const userObject = user.toObject();
      const { password, ...userNew } = userObject;

      res.status(200).json({
        user: userNew,
        accessToken: accessToken,
      });
    }
  } catch (error) {
    res.status(500).json(error);
  }
};

// [GET] /api/v1/users/logout
export const logout = async (req: Request, res: Response): Promise<void> => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    res.status(403).json("Token not required");
    return;
  }
  await RefreshToken.deleteOne({
    refreshToken: refreshToken,
  });
  res.clearCookie("refreshToken");
  res.status(200).json("Logout success");
};
