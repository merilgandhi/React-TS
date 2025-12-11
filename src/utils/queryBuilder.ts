import { Op } from "sequelize";

export const buildQueryOptions = (req, searchableFields = []) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  const where: any = {};


  if (req.query.search) {
    where[Op.or] = searchableFields.map((field) => ({
      [field]: { [Op.like]: `%${req.query.search}%` },
    }));
  }

  
  if (req.query.status !== undefined) {
    where.status = req.query.status === "true";
  }

  
  const sortBy = req.query.sortBy || "id";
  const order = req.query.order === "asc" ? "ASC" : "DESC";

 
  const paranoid = !(req.query.deleted === "true");

  return {
    where,
    limit,
    offset,
    order: [[sortBy, order]],
    paranoid,
  };
};
