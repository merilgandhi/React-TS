import { variantCellTotals } from "./orderCalculations";
import type { Product, GetQtyFn, OrderMode } from "../types/order.types";

export const buildOrderItems = (
  products: Product[],
  variants: { id: number }[],
  getQty: GetQtyFn,
  mode: OrderMode,
  allowedVariantIds: number[],
  getVeriantId: GetQtyFn
) => {
  const items: any[] = [];

  for (const product of products) {
    for (const variant of variants) {
      const cell = variantCellTotals(product, variant.id, getQty);

      if (!cell.exists || !cell.strips || cell.strips <= 0) continue;

      if (mode === "update") {
        if (!allowedVariantIds.includes(variant.id)) continue;
        
        items.push({
          productVariationId: variant.id,
          quantity: cell.strips,
          orderProductVariationId: getVeriantId(product.id, variant.id),
        });
      } else {
        items.push({
          productId: product.id,
          productVariationId: variant.id,
          quantity: cell.strips,
          total: cell.total,
        });
      }
    }
  }

  return items;
};
