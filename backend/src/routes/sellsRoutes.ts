import { Router } from "express";
import {
  createOrder,
  listOrders,
  getOrderById,
} from "@controllers/orders/index";
import { createOrderSchema } from "@controllers/orders/validator";
import { auth } from "@middleware/auth";
import { pagination } from "@middleware/pagination";
import { validate } from "@middleware/validate";

const router = Router();

router.post("/sell", auth, validate(createOrderSchema), createOrder);
router.get("/", auth, pagination, listOrders);
router.get("/:id", auth, getOrderById);

export default router;
