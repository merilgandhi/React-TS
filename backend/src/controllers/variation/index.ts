import { Request, Response } from "express";
import { Variation, User } from "@models/index";
import { Op } from "sequelize";

// ===============================
// LIST ALL VARIATIONS
// ===============================
export const listAll = async (req: Request, res: Response) => {
  try {
    const { page, limit, offset } = req.pagination!;

    const search = req.query.search ? String(req.query.search) : null;
    const status = req.query.status;
    const from = req.query.from;
    const to = req.query.to;
    const deleted = req.query.deleted === "true";
    const sortBy = req.query.sortBy ? String(req.query.sortBy) : "id";
    const order = req.query.order === "asc" ? "ASC" : "DESC";

    const where: any = {};

    // SEARCH
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { "$creator.name$": { [Op.like]: `%${search}%` } }
      ];
    }

    // FILTER STATUS
    if (status !== undefined) {
      where.status = status === "true";
    }

    // DATE RANGE FILTER
    if (from && to) {
      where.createdAt = { [Op.between]: [new Date(from), new Date(to)] };
    } else if (from) {
      where.createdAt = { [Op.gte]: new Date(from) };
    } else if (to) {
      where.createdAt = { [Op.lte]: new Date(to) };
    }

    // INCLUDE DELETED?
    const paranoid = deleted ? false : true;

    const { rows, count } = await Variation.findAndCountAll({
      where,
      limit,
      offset,
      paranoid,
      include: [
        {
          as: "creator",
          model: User,
          attributes: ["id", "name", "email"]
        }
      ],
      order: [[sortBy, order]]
    });

    return res.status(200).json({
      success: true,
      data: rows,
      total: count,
      currentPage: page,
      totalPages: Math.ceil(count / limit)
    });

  } catch (err: any) {
    console.error("LIST VARIATIONS ERROR:", err);
    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: "Failed to fetch variations",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};


// ===============================
// GET BY ID
// ===============================
export const getById = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    const variation = await Variation.findByPk(id);
    if (!variation) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: "Variation not found",
        variationId: id,
      });
    }

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Variation fetched successfully",
      variation,
    });

  } catch (err: any) {
    console.error("GET VARIATION BY ID ERROR:", err);
    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: "Failed to fetch variation",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};


// ===============================
// CREATE VARIATION
// ===============================
export const create = async (req: Request, res: Response) => {
  try {
    const { name, status } = req.body;
    const userId = req.user.id;

    const variation = await Variation.create({
      name,
      status,
      createdBy: userId,
      updatedBy: userId,
    });

    return res.status(201).json({
      message: "Variation created successfully",
      status: true,
      statuscode: 201,
      variation,
    });

  } catch (err: any) {
    console.error("CREATE VARIATION ERROR:", err);
    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: "Failed to create variation",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};


// ===============================
// UPDATE VARIATION
// ===============================
export const update = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { name, status } = req.body;
    const userId = req.user.id;

    const variation = await Variation.findByPk(id);
    if (!variation) {
      return res.status(404).json({
        message: "Variation not found",
        status: false,
        statuscode: 404,
      });
    }

    variation.name = name;
    variation.status = status;
    variation.updatedBy = userId;

    await variation.save();

    return res.status(200).json({
      message: "Variation updated successfully",
      status: true,
      statuscode: 200,
      variation
    });

  } catch (err: any) {
    console.error("UPDATE VARIATION ERROR:", err);
    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: "Failed to update variation",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};


// ===============================
// DELETE VARIATION
// ===============================
export const remove = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    const variation = await Variation.findByPk(id);
    if (!variation) {
      return res.status(404).json({
        message: "Variation not found",
        status: false,
        statuscode: 404,
      });
    }

    await variation.destroy();

    return res.status(200).json({
      message: "Variation deleted successfully",
      status: true,
      statuscode: 200,
    });

  } catch (err: any) {
    console.error("DELETE VARIATION ERROR:", err);
    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: "Failed to delete variation",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};


// ===============================
// RESTORE VARIATION
// ===============================
export const restore = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    const variation = await Variation.findByPk(id, { paranoid: false });
    if (!variation) {
      return res.status(404).json({
        message: "Variation not found",
        status: false,
        statuscode: 404,
      });
    }

    await variation.restore();

    return res.status(200).json({
      message: "Variation restored successfully",
      status: true,
      statuscode: 200,
    });

  } catch (err: any) {
    console.error("RESTORE VARIATION ERROR:", err);
    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: "Failed to restore variation",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};
