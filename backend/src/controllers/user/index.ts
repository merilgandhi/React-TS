import { Request, Response } from "express";
import { User } from "@models/User";
import jwt from "jsonwebtoken";
import { generateToken } from "@middleware/auth"



const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"; // use .env

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.findAll();
    return res.status(200).json({ success: true, statusCode: 200, data: users });
  } catch (err: any) {
    console.error("GET USERS ERROR:", err);
    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: "Failed to fetch users",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ where: { name } });
    if (existingUser) {
      return res.status(409).json({
        status: "false",
        statuscode: 409,
        message: "Name already exists",
      });
    }

    // Create user
    const newUser = await User.create({ name, email, password });

    // Remove password before returning
    const safeUser = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      definedAt: newUser.createdAt,
    };

    return res.status(201).json({
      status: "success",
      statuscode: 201,
      message: "User created successfully",
      data: safeUser,
    });
  } catch (err: any) {
    console.error("CREATE USER ERROR:", err);
    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: "Failed to create user",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.scope("withPassword").findOne({
    where: { email }
  });

  if (!user) {
    return res.status(400).json({
      success: false,
      statusCode: 400,
      message: "Invalid email or user not found",
    });
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return res.status(400).json({
      success: false,
      statusCode: 400,
      message: "Invalid password",
    });
  }

  const token = generateToken(user.id);

  // Now user.toJSON will remove password automatically
  return res.json({
    status: true,
    message: "Login successful",
    data: {
      token,
      id: user.id,
      username: user.name,
      email: user.email,
      createAt: user.createdAt,
      updatedAt: user.updatedAt,
    }
  });
};


export const logoutUser = (req: Request, res: Response) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: false, // true if using HTTPS
    sameSite: "lax",
  });

  return res.json({ message: "Logged out successfully" });
};
