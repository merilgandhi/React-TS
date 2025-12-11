import { Router } from "express";
import { auth } from "@middleware/auth";
import { validate } from "@middleware/validate";
import {
  remove,
  update,
  create,
  listAll,
  getById,
  restore
} from "@controllers/variation/index";
import { variationSchema } from "@controllers/variation/validator";
import { pagination } from "@middleware/pagination";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Variations
 *   description: Variation management (CRUD + soft delete + restore)
 */

/**
 * @swagger
 * /api/variations:
 *   get:
 *     summary: Get all variations (with pagination, search, filter, sorting)
 *     tags: [Variations]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of results per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search variations by name or creator name
 *       - in: query
 *         name: status
 *         schema:
 *           type: boolean
 *         description: Filter by status true/false
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: Field to sort by (id, name, createdAt, etc.)
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *         description: Sort direction (asc or desc)
 *     responses:
 *       200:
 *         description: List of variations
 *       500:
 *         description: Server error
 */
router.get("/", pagination, listAll);

/**
 * @swagger
 * /api/variations/{id}:
 *   get:
 *     summary: Get variation by ID
 *     tags: [Variations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Variation ID
 *     responses:
 *       200:
 *         description: Variation fetched successfully
 *       404:
 *         description: Variation not found
 */
router.get("/:id", auth, getById);
 

/**
 * @swagger
 * /api/variations:
 *   post:
 *     summary: Create new variation
 *     tags: [Variations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - status
 *             properties:
 *               name:
 *                 type: string
 *                 example: Red
 *               status:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Variation created successfully
 *       400:
 *         description: Validation error
 */
router.post("/", auth, validate(variationSchema), create);

/**
 * @swagger
 * /api/variations/{id}:
 *   put:
 *     summary: Update variation
 *     tags: [Variations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               status:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Variation updated successfully
 *       404:
 *         description: Variation not found
 */
router.put("/:id", auth, validate(variationSchema), update);

/**
 * @swagger
 * /api/variations/{id}/restore:
 *   patch:
 *     summary: Restore a soft-deleted variation
 *     tags: [Variations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Variation restored successfully
 *       404:
 *         description: Variation not found
 */
router.patch("/:id/restore", auth, restore);

/**
 * @swagger
 * /api/variations/{id}:
 *   delete:
 *     summary: Soft delete variation
 *     tags: [Variations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Variation deleted successfully
 *       404:
 *         description: Variation not found
 */
router.delete("/:id", auth, remove);

export default router;
