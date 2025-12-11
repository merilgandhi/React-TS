import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

interface TokenPayload {
  id: number;
}

export const generateToken = (id: number) => {
  return jwt.sign({ id }, JWT_SECRET, {
    expiresIn: "7d", // or 30d, your choice
  });
};

export const auth = (req: Request, res: Response, next: NextFunction) => {
  // Support cookie OR "Authorization: Bearer <token>" for 3 different frontends
  const token =
    req.cookies?.token ||
    req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;

    // VERY IMPORTANT: ensure id is present
    if (!decoded || typeof decoded.id !== "number") {
      return res.status(401).json({ message: "Invalid token payload" });
    }

    // attach id only
    (req as any).user = { id: decoded.id };

    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};
