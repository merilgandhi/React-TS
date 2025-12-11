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

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Failed to fetch variations",
      status: false,
      statuscode: 500,
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
        message: "Variation not found",
        status: false,
        statuscode: 404,
      });
    }

    return res.status(200).json({
      message: "Variation fetched successfully",
      status: true,
      statuscode: 200,
      variation,
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "failed to fetch variation",
      status: false,
      statuscode: 500,
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

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Failed to create variation",
      status: false,
      statuscode: 500,
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

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Variation already exists",
      status: false,
      statuscode: 500,
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

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Failed to delete variation",
      status: false,
      statuscode: 500,
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

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Failed to restore variation",
      status: false,
      statuscode: 500,
    });
  }
};
