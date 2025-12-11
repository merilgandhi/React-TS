import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET must be set in environment");
}

interface TokenPayload extends JwtPayload {
  sub: string; // subject: user id as string
}

export const generateToken = (userId: number | string) => {
  return jwt.sign(
    { sub: String(userId) },
    JWT_SECRET,
    {
      algorithm: "HS256",
      expiresIn: "7d",
      issuer: "your-app-name",
      audience: "your-app-client",
    }
  );
};

export const auth = (req: Request, res: Response, next: NextFunction) => {
  const rawToken =
    req.cookies?.token ||
    (typeof req.headers.authorization === "string"
      ? req.headers.authorization.split(" ")[1]
      : undefined);

  if (!rawToken) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  try {
    const decoded = jwt.verify(rawToken, JWT_SECRET, {
      algorithms: ["HS256"],
      issuer: "your-app-name",
      audience: "your-app-client",
    }) as TokenPayload | string;

    if (!decoded || typeof decoded === "string") {
      return res.status(401).json({ message: "Invalid token payload" });
    }

    if (!decoded.sub) {
      return res.status(401).json({ message: "Token missing subject" });
    }

    // attach minimal, trusted info to request
    (req as any).user = {
      id: decoded.sub
    };

    next();
  } catch (err) {
    return res.status(401).json({ 
      status: false,
      statuscode: 401,
      message: "Invalid or expired token",
      error: err
      
     });
  }
};