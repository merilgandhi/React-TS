import type {Product} from "../types/order.types"

export const mapProducts = (products: any[]): Product[] => {
  return products.map((p) => ({
    id: p.id,
    name: p.name,
    gst: Number(p.gst ?? 0),
    variants: (p.variants || []).map((v: any) => {
      return{
      id: v.variationId,
      vId: v.id,
      name: v.Variation?.name ?? v.name ?? "Variant",
      price: Number(v.price ?? 0),
      boxQuantity: Number(v.boxQuantity ?? 1),
    }
  }),
  }));
};

export const mapOrderToQuantities = (
  order: any,
  products: Product[],
) => {
  const qtyMap: Record<string, {
    quantity: number; orderProductVariationId: number
  }> = {};
  const allowedVariantIds: number[] = [];

  const orderItems : any[] = [];
  
  order.items.forEach((item: any) => {
    const product = products.find((p) => p.id === item.product.id);
    if (!product) return;

    const variant = product.variants.find(
      (v) => Number(v.price) === Number(item.unitPrice)
    );
    if (!variant) return;


    orderItems.push(
      {
        productId: product.id,
        orderProductVariationId: item.id,
        productVariationId: variant.id,
        quantity: item.quantity,
        total: item.total,
      }
    );
    qtyMap[`${product.id}__${variant.id}`] = {quantity : item.quantity, orderProductVariationId: item.id || 0}
    allowedVariantIds.push(variant.id);
  });

  return { qtyMap, allowedVariantIds, orderItems };
};
