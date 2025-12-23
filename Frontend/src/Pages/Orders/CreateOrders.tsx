import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { SuccessToast, ErrorToast } from "../../components/ToastStyles";
import OrderVariantCell from "../../components/OrderVariantCell";
import { useOrders } from "../../hooks/useOrders";
import { OrderService } from "../../Services/order.service";
import { grandTotal } from "../../utils/orderCalculations";
import type { OrderMode, Product } from "../../types/order.types";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";

export default function CreateOrders({
  onSuccess,
}: {
  onSuccess?: () => void;
}) {
  const { sellers, products, loading } = useOrders();

  const [selectedSeller, setSelectedSeller] = useState<number | "">("");
  const [orderQuantities, setOrderQuantities] = useState<any>({});
  const [creating, setCreating] = useState(false);
  const navigate = useNavigate();
  const getQty = (productId: number, variationId: number) => {
    return orderQuantities[productId]?.[variationId]?.quantity || 0;
  };
  const { orderId } = useParams<{ orderId: string }>();
  const orderid = orderId ? Number(orderId) : undefined;

  const pathname = window.location.pathname;

  const mode: OrderMode = pathname.includes("/edit")
    ? "update"
    : pathname.includes("/view")
    ? "view"
    : "create";

  const updateQuantity = (
    productId: number,
    variantId: number,
    value: number
  ) => {
    setOrderQuantities((prev: any) => ({
      ...prev,
      [productId]: {
        ...(prev[productId] || {}),
        [variantId]: {
          ...(prev[productId]?.[variantId] || {}),
          quantity: value,
        },
      },
    }));
  };

  useEffect(() => {
    if (mode === "view" || mode === "update") {
      if (!orderid) return;
      fetchOrderById(orderid);
    }
  }, [orderid, mode, products]);

  const fetchOrderById = async (id: number) => {
    try {
      const orderData = await OrderService.getOrderById(id);
      setSelectedSeller(orderData.seller.id);

      const quantities: any = {};

      orderData.items.forEach((item: any) => {
        const productId = item.product.id;

        const product = products.find((p) => p.id === productId);
        if (!product) return;

        const matchedVariant = product.variants.find(
          (v) => v.name === item.productVariation.variation.name
        );

        if (!matchedVariant) return;

        if (!quantities[productId]) {
          quantities[productId] = {};
        }

        quantities[productId][matchedVariant.id] = {
          quantity: item.quantity,
          orderProductVariationId: item.id,
        };
      });

      setOrderQuantities(quantities);
    } catch (error) {
      console.error("Error fetching order:", error);
      toast.custom(() => <ErrorToast message="Failed to load order data" />);
    }
  };
  const globalVariants = useMemo(() => {
    const map = new Map<number, { id: number; name: string }>();

    products.forEach((p: Product) =>
      p.variants.forEach((v) => {
        if (!map.has(v.id)) {
          map.set(v.id, { id: v.id, name: v.name });
        }
      })
    );

    return Array.from(map.values());
  }, [products]);

  const [colWidths, setColWidths] = useState<Record<string, number>>({
    product: 220,
    subtotal: 120,
    gst: 100,
    total: 120,
  });

  useEffect(() => {
    if (!globalVariants.length) return;

    setColWidths((prev) => {
      const next = { ...prev };
      globalVariants.forEach((gv) => {
        const key = `v-${gv.id}`;
        if (!next[key]) next[key] = 160;
      });
      return next;
    });
  }, [globalVariants]);

  const items = useMemo(() => {
    const result: any[] = [];

    Object.entries(orderQuantities).forEach(
      ([productId, variants]: [string, any]) => {
        Object.entries(variants).forEach(([variantId, data]: [string, any]) => {
          const qty = Number(data?.quantity || 0);

          if (qty > 0) {
            result.push({
              productId: Number(productId),
              productVariationId: Number(variantId),
              quantity: qty,
              orderProductVariationId: data.orderProductVariationId,
            });
          }
        });
      }
    );

    return result;
  }, [orderQuantities]);

  const submitOrder = async () => {
    if (!selectedSeller) {
      toast.custom(() => <ErrorToast message="Please select a seller" />);
      return;
    }

    if (!items.length) {
      toast.custom(() => <ErrorToast message="Enter at least one quantity" />);
      return;
    }

    try {
      setCreating(true);

      if (mode === "update") {
        await OrderService.updateOrder(orderid!, { items });
      } else {
        await OrderService.createOrder({
          sellerId: selectedSeller,
          items,
          grandTotal: grandTotal(products, globalVariants, getQty),
        });
      }

      toast.custom(() => <SuccessToast message="Order saved successfully" />);
      onSuccess?.();
    } catch {
      toast.custom(() => <ErrorToast message="Failed to process order" />);
    } finally {
      setCreating(false);
    }
  };

  const colSpan = globalVariants.length + 4;

  const doTotal = useMemo(() => {
    const total: any = {};
    const orderItem = Object.keys(orderQuantities) as unknown as number[];
    orderItem.forEach((item: number) => {
      const product = products.find((pro) => pro.id == item);
      if (!product) {
        return;
      }
      let productTotal = 0;
      product.variants.forEach((variant) => {
        productTotal +=
          (Number(orderQuantities[item]?.[variant.id]?.quantity) || 0) *
          Number(variant.price);
      });

      const gst = (productTotal * product.gst) / 100;
      total[item] = {
        productTotal,
        gst,
        finalTotal: productTotal + gst,
      };
    });
    return total;
  }, [orderQuantities, products]);
  const footerTotals = useMemo(() => {
    let subtotal = 0;
    let gst = 0;
    let total = 0;

    Object.values(doTotal).forEach((row: any) => {
      subtotal += row.productTotal || 0;
      gst += row.gst || 0;
      total += row.finalTotal || 0;
    });

    return { subtotal, gst, total };
  }, [doTotal]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      {mode !== "create" && (
        <button
          onClick={() => navigate("/orderslist")}
          className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-slate-900"
        >
          ← Back to Orders List
        </button>
      )}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">
          {mode === "update"
            ? "Update Order"
            : mode === "view"
            ? "View Order"
            : "Create Order"}
        </h1>

        {mode !== "view" && (
          <button
            onClick={submitOrder}
            disabled={creating}
            className="px-4 py-2 bg-slate-900 text-white rounded font-semibold"
          >
            {creating
              ? mode === "update"
                ? "Updating..."
                : "Creating..."
              : mode === "update"
              ? "Update Order"
              : "Create Order"}
          </button>
        )}
      </div>

      {/* Seller Selection */}
      <div className="bg-white p-4 rounded shadow border flex items-center gap-4">
        <label className="font-medium text-slate-700">Select Seller</label>
        <select
          disabled={mode !== "create"}
          className="px-3 py-2 border rounded"
          value={selectedSeller}
          onChange={(e) =>
            setSelectedSeller(e.target.value ? Number(e.target.value) : "")
          }
        >
          <option value="">-- Choose Seller --</option>
          {sellers.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>
      {!selectedSeller && mode === "create" ? (
        <div className="bg-white p-6 rounded shadow text-center text-slate-500 border">
          Please select a seller to view products & variants.
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-auto">
          <table
            className="min-w-full border-collapse text-sm"
            style={{ tableLayout: "fixed" }}
          >
            <thead>
              <tr>
                {/* Product Header */}
                <th
                  style={{
                    ...headerLeftStyle,
                    width: colWidths.product,
                  }}
                  className="text-left px-4 py-3 border-r text-slate-200 uppercase tracking-wide text-xs"
                >
                  Product
                </th>

                {/* Variant Headers */}
                {globalVariants.map((gv) => (
                  <th
                    key={gv.id}
                    colSpan={3}
                    style={{ ...headerStyle, width: 180 }}
                    className="px-2 py-3 border-r"
                  >
                    <div className="text-amber-300 font-semibold text-xs uppercase tracking-wide whitespace-nowrap text-center">
                      {gv.name}
                    </div>
                  </th>
                ))}

                <th
                  style={{ ...headerStyle, width: colWidths.subtotal }}
                  className="text-right px-4 py-3 border-r uppercase tracking-wide text-xs"
                >
                  Subtotal
                </th>
                <th
                  style={{ ...headerStyle, width: colWidths.gst }}
                  className="text-right px-4 py-3 border-r uppercase tracking-wide text-xs"
                >
                  GST
                </th>
                <th
                  style={{ ...headerStyle, width: colWidths.total }}
                  className="text-right px-4 py-3 uppercase tracking-wide text-xs"
                >
                  Total
                </th>
              </tr>
            </thead>

            {/* ===================== BODY ===================== */}
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={colSpan}
                    className="p-8 text-center text-slate-500"
                  >
                    Loading products…
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td
                    colSpan={colSpan}
                    className="p-8 text-center text-slate-500"
                  >
                    No products available
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr
                    key={product.id}
                    className="align-top hover:bg-slate-50 transition-colors"
                  >
                    {/* Product Name */}
                    <td
                      style={{
                        ...(stickyLeftStyle as React.CSSProperties),
                        width: colWidths.product,
                      }}
                      className="px-4 py-3 border-r bg-slate-50 font-medium text-slate-700"
                    >
                      {product.name}
                    </td>

                    {/* Variant Cells */}
                    {globalVariants.map((gv) => {
                      const item = product.variants.find((v) => v.id === gv.id);

                      return item ? (
                        <OrderVariantCell
                          key={`${product.id}-${item.id}`}
                          variation={item}
                          quantity={getQty(product.id, item.id)}
                          disabled={mode === "view"}
                          onChange={(val) =>
                            updateQuantity(product.id, item.id, val)
                          }
                        />
                      ) : (
                        <td
                          key={`${product.id}-${gv.id}`}
                          colSpan={3}
                          className="text-center text-slate-400 border-r"
                        >
                          —
                        </td>
                      );
                    })}

                    {/* Row Totals */}
                    <td className="px-4 py-3 text-right border-r tabular-nums text-slate-700">
                      {doTotal[product.id]?.productTotal?.toFixed(2) || "0.00"}
                    </td>
                    <td className="px-4 py-3 text-right border-r tabular-nums text-slate-700">
                      {doTotal[product.id]?.gst?.toFixed(2) || "0.00"}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums font-semibold text-slate-800">
                      {doTotal[product.id]?.finalTotal?.toFixed(2) || "0.00"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>

            {/* ===================== FOOTER ===================== */}
            <tfoot>
              <tr className="bg-slate-900 text-white font-semibold">
                <td
                  style={{
                    ...(stickyLeftStyle as React.CSSProperties),
                    width: colWidths.product,
                  }}
                  className="px-4 py-4 text-right uppercase tracking-wide"
                >
                  Grand Total
                </td>

                {globalVariants.map((gv) => (
                  <td key={gv.id} colSpan={3}></td>
                ))}

                <td className="px-4 py-4 text-right tabular-nums">
                  ₹ {footerTotals.subtotal.toFixed(2)}
                </td>
                <td className="px-4 py-4 text-right tabular-nums text-amber-300">
                  ₹ {footerTotals.gst.toFixed(2)}
                </td>
                <td className="px-4 py-4 text-right tabular-nums text-emerald-300 text-lg">
                  ₹ {footerTotals.total.toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}

const stickyLeftStyle: React.CSSProperties = {
  position: "sticky",
  left: 0,
  zIndex: 20,
  background: "#f8fafc",
};

const headerStyle: React.CSSProperties = {
  background: "#0f172a",
  color: "#e5e7eb",
  fontWeight: 600,
  borderBottom: "1px solid rgba(255,255,255,0.08)",
};

const headerLeftStyle: React.CSSProperties = {
  ...headerStyle,
  position: "sticky",
  left: 0,
  zIndex: 30,
};
