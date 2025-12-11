import { Router } from "express";
import { getUsers, createUser, loginUser, logoutUser } from "@controllers/user";
import { validate } from "@middleware/validate";
import { createUserSchema, loginUserSchema } from "@controllers/user/validator";
import { auth } from "@middleware/auth";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User Authentication & Management
 */

/**
 * @swagger
 * /api/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 example: johndoe@gmail.com
 *               password:
 *                 type: string
 *                 example: secret123
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Validation error
 */
router.post("/register", validate(createUserSchema), createUser);

/**
 * @swagger
 * /api/login:
 *   post:
 *     summary: Login user and receive token
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: johndoe@gmail.com
 *               password:
 *                 type: string
 *                 example: secret123
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Invalid email or password
 */
router.post("/login", validate(loginUserSchema), loginUser);

/**
 * @swagger
 * /api/logout:
 *   post:
 *     summary: Logout user (removes cookies/token)
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Logged out successfully
 */
router.post("/logout", logoutUser);

/**
 * @swagger
 * /api:
 *   get:
 *     summary: Get all users (protected)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users
 *       401:
 *         description: Unauthorized
 */
router.get("/", auth, getUsers);

export default router;
