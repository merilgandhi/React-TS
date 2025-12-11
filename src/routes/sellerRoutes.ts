import { Router } from "express";
import { createSeller, listAll, updateSeller, deleteSeller } from "@controllers/seller/index";
import { auth } from "@middleware/auth";
import { validate } from "@middleware/validate";
import { pagination } from "@middleware/pagination";
import { sellerSchema } from "@controllers/seller/validator";

const router = Router();



router.post("/", auth, validate(sellerSchema), createSeller);
router.put("/:id", auth, validate(sellerSchema), updateSeller);

router.get("/", auth, pagination,  listAll);
//router.get("/:id", auth, listAll);
router.delete("/:id", auth, deleteSeller);
export default router;

/**
 * @swagger
 * tags:
 *   - name: Sellers
 *     description: Manage sellers in the inventory system
 */


/**
 * @swagger
 * /api/sellers:
 *   get:
 *     summary: Get all sellers (paginated, searchable)
 *     tags: [Sellers]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         example: "rahul"
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         example: 10
 *     responses:
 *       200:
 *         description: List of sellers returned successfully
 */

/**
 * @swagger
 * /api/sellers/{id}:
 *   get:
 *     summary: Get seller by ID
 *     tags: [Sellers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Seller fetched successfully
 *       404:
 *         description: Seller not found
 */

/**
 * @swagger
 * /api/sellers:
 *   post:
 *     summary: Create a new seller
 *     tags: [Sellers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/SellerInput"
 *     responses:
 *       201:
 *         description: Seller created successfully
 *       400:
 *         description: Validation error
 */

/**
 * @swagger
 * /api/sellers/{id}:
 *   put:
 *     summary: Update seller information
 *     tags: [Sellers]
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
 *             $ref: "#/components/schemas/SellerInput"
 *     responses:
 *       200:
 *         description: Seller updated successfully
 *       404:
 *         description: Seller not found
 */

/**
 * @swagger
 * /api/sellers/{id}:
 *   delete:
 *     summary: Soft-delete seller
 *     tags: [Sellers]
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
 *         description: Seller deleted successfully
 *       404:
 *         description: Seller not found
 */

/**
 * @swagger
 * /api/sellers/{id}/restore:
 *   patch:
 *     summary: Restore soft-deleted seller
 *     tags: [Sellers]
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
 *         description: Seller restored successfully
 *       404:
 *         description: Seller not found
 */
