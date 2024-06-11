import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers["authorization"];
  const accessToken = authHeader?.split(" ")[1];

  if (!accessToken) {
    res.status(401).json("Token required");
    return;
  }

  jwt.verify(
    accessToken || "",
    process.env.ACCESS_TOKEN_SECRET || "",
    (error, user) => {
      if (error) {
        res.status(403).json("User not unthorization");
        return;
      }
      res.locals.user = user;
      next();
    }
  );
};
