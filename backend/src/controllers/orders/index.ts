import { Request, Response } from "express";
import { ProductVariation, Product, Variation, Orders, OrderItem, Seller } from "@models/index";
import { Op } from "sequelize";
import { sequelize } from "@config/database";


export const checkBarcode = async (req: Request, res: Response) => {
  try {
    const { barcode } = req.params;

    const pv = await ProductVariation.findOne({
      where: {
        [Op.or]: [{ productQrCode: barcode }, { boxQrCode: barcode }],
      },
      include: [{ model: Product }, { model: Variation }],
    });

    if (!pv) {
      return res.status(404).json({
        exists: false,
        message: "No product found with this barcode. Create a new one.",
      });
    }

    let responseData = null;

    if (pv.productQrCode == barcode) {
      responseData = {
        type: "PRODUCT_QR",
        productId: pv.productId,
        variationId: pv.variationId,
        product: pv.Product,
        variation: pv.Variation,
        pricePerUnit: pv.price,
        stockInHand: pv.stockInHand,
        scannedQr: "productQrCode",
      };
    }
     else if (pv.boxQrCode == barcode) {
      responseData = {
        type: "BOX_QR",
        productId: pv.productId,
        variationId: pv.variationId,
        product: pv.Product,
        variation: pv.Variation,
        boxQuantity: pv.boxQuantity,
        boxQrCode: pv.boxQrCode,
        stockInHand: pv.stockInHand,
        scannedQr: "boxQrCode",
      };
    }
    return res.status(200).json({
      status: true,
      statusCode:200,
      message: "Product found",
      data: responseData,
    });
  } catch (err: any) {
    console.error("CHECK BARCODE ERROR:", err);
    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: "Unable to fetch product for given barcode",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

export const createProductFromScan = async (req: Request, res: Response) => {
  const t = await sequelize.transaction();

  try {
    const userId = req.user.id;
    const { product, variation, productVariation } = req.body;

    
    const newProduct = await Product.create(
      {
        ...product,
        createdBy: userId,
        updatedBy: userId,
      },
      { transaction: t }
    );

    
    const newVariation = await Variation.create(
      {
        ...variation,
        createdBy: userId,
        updatedBy: userId
      },
      { transaction: t }
    );

 
    const newPV = await ProductVariation.create(
      {
        ...productVariation,
        productId: newProduct.id,
        variationId: newVariation.id
      },
      { transaction: t }
    );

    await t.commit();

    return res.status(201).json({
      success: true,
      message: "New product created successfully",
      product: newProduct,
      variation: newVariation,
      productVariation: newPV
    });

  } catch (err: any) {
    console.error("CREATE FROM SCAN ERROR:", err);
    await t.rollback();
    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: "Failed to create product from scan",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};


export const createOrder = async (req: Request, res: Response) => {
  const t = await sequelize.transaction();

  try {
    const { sellerId, items } = req.body;

    if (!sellerId) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: "sellerId is required",
      });
    }

    if (!Array.isArray(items) || items.length === 0) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: "items must be a non-empty array",
      });
    }

    // 1️ Create order first
    const order = await Orders.create(
      {
        sellerId,
        subtotal: 0,
        gstTotal: 0,
        grandTotal: 0,
        status: "COMPLETED",
      },
      { transaction: t }
    );

    let subtotal = 0;
    let gstTotal = 0;

    // 2️ Loop items
    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      const qty = Number(item.quantity);
      if (!item.productVariationId || !Number.isInteger(qty) || qty <= 0) {
        await t.rollback();
        return res.status(400).json({
          success: false,
          message: `Invalid quantity at item index ${i}`,
        });
      }

      // 3️ Try finding ProductVariation by PK
      let pv = await ProductVariation.findByPk(item.productVariationId, {
        include: [{ model: Product }, { model: Variation }],
        transaction: t,
        lock: t.LOCK.UPDATE,
      });

      // 4️ Fallback: variation.id + productId
      if (!pv) {
        const where: any = { variationId: item.productVariationId };

        if (item.productId) {
          where.productId = item.productId;
        }

        pv = await ProductVariation.findOne({
          where,
          include: [{ model: Product }, { model: Variation }],
          transaction: t,
          lock: t.LOCK.UPDATE,
        });
      }

      //  Still not found
      if (!pv) {
        await t.rollback();
        return res.status(404).json({
          success: false,
          message: "Product variation not found",
          details: {
            productId: item.productId ?? null,
            productVariationId: item.productVariationId,
          },
        });
      }

      // 5️ Stock check
      if (pv.stockInHand < qty) {
        await t.rollback();
        return res.status(400).json({
          success: false,
          message: "Insufficient stock",
          product: pv.Product?.name,
          variation: pv.Variation?.name,
          availableStock: pv.stockInHand,
          requested: qty,
        });
      }

      // 6️ Deduct stock
      await pv.update(
        {
          stockInHand: pv.stockInHand - qty,
        },
        { transaction: t }
      );

      // 7️ Price & GST calc
      const unitPrice = Number(pv.price);
      const gstPercent = Number(pv.Product?.gst || 0);

      const lineBase = +(unitPrice * qty).toFixed(2);
      const lineGst = +((lineBase * gstPercent) / 100).toFixed(2);
      const lineTotal = +(lineBase + lineGst).toFixed(2);

      subtotal += lineBase;
      gstTotal += lineGst;

      // 8️ Create order item
      await OrderItem.create(
        {
          orderId: order.id,
          productId: pv.productId,
          productVariationId: pv.id,
          quantity: qty,
          unitPrice,
          gstPercent,
          gstAmount: lineGst,
          total: lineTotal,
        },
        { transaction: t }
      );
    }

    const grandTotal = +(subtotal + gstTotal).toFixed(2);

    // 9️ Update order totals
    await order.update(
      {
        subtotal,
        gstTotal,
        grandTotal,
      },
      { transaction: t }
    );

    await t.commit();

    return res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: {
        orderId: order.id,
        subtotal,
        gstTotal,
        grandTotal,
      },
    });
  } catch (err: any) {
    console.error("CREATE ORDER ERROR:", err);
    await t.rollback();

    return res.status(500).json({
      success: false,
      message: "Failed to create order",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

export const listOrders = async (req: Request, res: Response) => {
  try {
    const { page, limit, offset } = req.pagination!;

    const sellerId = req.query.sellerId;
    const status = req.query.status;
    const from = req.query.from;
    const to = req.query.to;
    const deleted = req.query.deleted === "true";

    const where: any = {};

    if (sellerId) where.sellerId = Number(sellerId);
    if (status) where.status = status;

    if (from && to) {
      where.createdAt = { [Op.between]: [new Date(from), new Date(to)] };
    } else if (from) {
      where.createdAt = { [Op.gte]: new Date(from) };
    } else if (to) {
      where.createdAt = { [Op.lte]: new Date(to) };
    }

    const paranoid = deleted ? false : true;

    const { rows, count } = await Orders.findAndCountAll({
      where,
      limit,
      offset,
      paranoid,
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: Seller,
          as: "seller",
          attributes: ["id", "name", "contactNumber"],
        },
        {
          model: OrderItem,
          as: "items",
          include: [
            {
              model: Product,
              as: "product",
              attributes: ["id", "name", "gst"],
            },
            {
              model: ProductVariation,
              as: "productVariation",
              include: [
                {
                  model: Variation,
                },
              ],
            },
          ],
        },
      ],
    });

    return res.status(200).json({
      success: true,
      data: rows,
      total: count,
      page,
      totalPages: Math.ceil(count / limit),
    });
  } catch (error) {
    console.error("LIST ORDERS ERROR:", error);
    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: "Failed to fetch orders",
    });
  }
};

export const getOrderById = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    const order = await Orders.findByPk(id, {
      include: [
        {
          model: Seller,
          as: "seller",
          attributes: ["id", "name", "contactNumber"],
        },
        {
          model: OrderItem,
          as: "items",
          include: [
            {
              model: Product,
              as: "product",
              attributes: ["id", "name"],
            },
            {
              model: ProductVariation,
              as: "productVariation",
              include: [
                {
                  model: Variation,
                  as: "variation",
                  attributes: ["id", "name"],
                },
              ],
            },
          ],
        },
      ],
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error("GET ORDER ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch order",
    });
  }
};