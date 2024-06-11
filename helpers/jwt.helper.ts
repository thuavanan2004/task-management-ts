import jwt from "jsonwebtoken";

export const generateAccessToken = (userId: string): string => {
  try {
    const secret = process.env.ACCESS_TOKEN_SECRET;
    if (!secret) {
      throw new Error(
        "ACCESS_TOKEN_SECRET is not defined in the environment variables."
      );
    }

    const token: string = jwt.sign({ userId }, secret, { expiresIn: "30s" });
    return token;
  } catch (error) {
    console.error("Error generating token:", error);
    throw error;
  }
};

export const generateRefreshToken = (userId: string): string => {
  try {
    const secret = process.env.REFRESH_TOKEN_SECRET;
    if (!secret) {
      throw new Error(
        "REFRESH_TOKEN_SECRET is not defined in the environment variables."
      );
    }

    const token: string = jwt.sign({ userId }, secret, { expiresIn: "7d" });
    return token;
  } catch (error) {
    console.error("Error generating token:", error);
    throw error;
  }
};
