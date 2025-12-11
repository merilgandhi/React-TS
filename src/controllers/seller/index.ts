import { Seller } from "@models/Seller";
import { Request, Response } from "express";
import { Op } from "sequelize";


export const createSeller = async (req: Request, res: Response) => {
  try {
    const { name, email, contactNumber, isActive } = req.body; 

    const newSeller = await Seller.create({
      name,
      email: email || null,
      contactNumber,
      isActive,
    });

    return res.status(201).json({
      success: true,
      statusCode: 201,
      message: "Seller created successfully",
      data: newSeller,
    });
  } catch (error) {
    console.error("CREATE SELLER ERROR:", error);
    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: "Error creating seller",
    });
  }
};

export const listAll = async (req: Request, res: Response) => {
  try {
    const { page, limit, offset } = req.pagination!;

    const search = req.query.search ? String(req.query.search) : null;
    const from = req.query.from;
    const to = req.query.to;
    const status = req.query.status ? String(req.query.status) : null;
    const deleted = req.query.deleted === "true";
    const sortBy = req.query.sortBy ? String(req.query.sortBy) : "id";
    const order = req.query.order === "asc" ? "ASC" : "DESC";

    const where: any = {};

    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { contactNumber: { [Op.like]: `%${search}%` } },
      ];
    }

    if (status !== null) {
      where.isActive = status === "true";
    }
    
    if (from && to) where.createdAt = { [Op.between]: [new Date(from), new Date(to)] };
    else if (from) where.createdAt = { [Op.gte]: new Date(from) };
    else if (to) where.createdAt = { [Op.lte]: new Date(to) };

    const paranoid = deleted ? false : true;

    const { rows, count } = await Seller.findAndCountAll({
      where,
      limit,
      offset,
      paranoid,
      order: [[sortBy, order]],
    });

    return res.status(200).json({
      success: true,
      data: rows,
      total: count,
      currentPage: page,
      totalPages: Math.ceil(count / limit),
    });
  } catch (err) {
    console.error("LIST SELLERS ERROR:", err);
    return res.status(500).json({ success: false, statusCode:500,message: "Failed To List All Sellers" });
  }
};

export const updateSeller = async (req: Request, res: Response) => {
  try {
    const sellerId = Number(req.params.id);
    const { name, email, contactNumber, isActive } = req.body;

    const seller = await Seller.findByPk(sellerId);

    if (!seller) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: "Seller not found",
      });
    }

    await seller.update({
      name,
      email: email || seller.email,
      contactNumber,
      isActive,
    });

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Seller updated successfully",
      seller,
    });
  } catch (error) {
    console.error("UPDATE SELLER ERROR:", error);
    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: "Error updating seller",
    });
  }
};


export const deleteSeller = async (req: Request, res: Response) => {
  try {
    const sellerId = Number(req.params.id);
    const seller = await Seller.findByPk(sellerId);
    
    await seller.destroy();

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Seller deleted successfully",
    });
  } catch (error) {
    console.error("DELETE SELLER ERROR:", error);
    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: "Error deleting seller",
    });
  }
}