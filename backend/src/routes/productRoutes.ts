import { Router } from "express";
import { auth } from "@middleware/auth";
import { pagination } from "@middleware/pagination";
import { validate } from "@middleware/validate";
import { productSchema } from "../controllers/product/validator";

import {
  listAll,
  getById,
  create,
  update,
  remove,
  restore
} from "@controllers/product";

const router = Router();
/**
 * 
 * @swagger
 * tags:
 *   - name: Products
 *     description: Product & Product Variation Management
 */

 


 /**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Create a new product with variants
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/ProductInput"
 *     responses:
 *       201:
 *         description: Product created successfully
 *       400:
 *         description: Validation error
 */


router.post("/", auth, validate(productSchema), create);


/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Get all products (with pagination + search)
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of all products
 */
router.get("/", pagination, listAll);
/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Get product by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Product fetched successfully
 *       404:
 *         description: Product not found
 */

router.get("/:id", getById);

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Update a product (ONLY product fields, not variations)
 *     tags: [Products]
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
 *             $ref: "#/components/schemas/ProductInput"
 *     responses:
 *       200:
 *         description: Product updated successfully
 *       404:
 *         description: Product not found
 */
router.put("/:id", auth, validate(productSchema), update);

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Soft-delete a product
 *     tags: [Products]
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
 *         description: Product deleted successfully
 *       404:
 *         description: Product not found
 */

router.delete("/:id", auth, remove);

/**
 * @swagger
 * /api/products/{id}/restore:
 *   patch:
 *     summary: Restore soft-deleted product
 *     tags: [Products]
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
 *         description: Product restored successfully
 *       404:
 *         description: Product not found
 */
router.patch("/:id/restore", auth, restore);

export default router;
