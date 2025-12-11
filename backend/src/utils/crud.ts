import { buildQueryOptions } from "./queryBuilder";

export const CRUD = (
  Model: any,
  searchableFields: string[] = [],
  include: any[] = []
) => {
  return {
    // CREATE 
    async create(req: Request, res: Response) {
      try {
        const userId = req.user?.id;
        const data = { ...req.body };

        // Auto-set createdBy, updatedBy if model contains these attributes
        if (Model.rawAttributes.createdBy) data.createdBy = userId;
        if (Model.rawAttributes.updatedBy) data.updatedBy = userId;

        const record = await Model.create(data);

        return res.status(201).json({
          success: true,
          statuscode: 201,
          message: `${Model.name} created`,
          data: record,
        });
      } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Server Error", statuscode: 500 });
      }
    },

    // GET ALL 
    async getAll(req, res) {
      try {
        const options = buildQueryOptions(req, searchableFields);

        const { rows, count } = await Model.findAndCountAll({
          ...options,
          include,
        });

        return res.status(200).json({
          success: true,
          statuscode: 200,
          data: rows,
          total: count,
          page: req.pagination?.page || 1,
          totalPages: Math.ceil(count / (req.pagination?.limit || 10)),
        });
      } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Server Error", statuscode: 500 });
      }
    },

    // GET BY ID 
    async getById(req, res) {
      try {
        const id = Number(req.params.id);
        const record = await Model.findByPk(id, { include });

        if (!record)
          return res.status(404).json({ success: false, message: "Not found", statuscode: 404 });

        return res.status(200).json({ success: true, data: record, statuscode: 200 });
      } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Server Error", statuscode: 500 });
      }
    },

    // UPDATE 
// UPDATE 
async update(req, res) {
  try {
    const id = Number(req.params.id);
    const record = await Model.findByPk(id);

    if (!record)
      return res.status(404).json({
        success: false,
        message: "Not found",
        statuscode: 404
      });

    // UNIQUE VALIDATION
    if (Model.rawAttributes.name && req.body.name) {
      const existing = await Model.findOne({
        where: { name: req.body.name }
      });

      // If a record exists and it's NOT the same record being updated
      if (existing && existing.id !== id) {
        return res.status(400).json({
          success: false,
          statuscode: 400,
          message: "This name already exists. Please choose another."
        });
      }
    }

    // Continue update
    Object.assign(record, req.body);

    if (Model.rawAttributes.updatedBy && req.user?.id) {
      record.updatedBy = req.user.id;
    }

    await record.save();

    return res.status(200).json({
      success: true,
      statuscode: 200,
      message: `${Model.name} updated`, 
      data: record,
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Server Error",
      statuscode: 500,
    });
  }
},


    // SOFT DELETE 
    async softDelete(req, res) {
      try {
        const record = await Model.findByPk(req.params.id);
        if (!record)
          return res.status(404).json({ success: false, message: "Not found", statuscode: 404 });

        await record.destroy();
        return res.status(200).json({ success: true, message: "Deleted", statuscode: 200 });
      } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Server Error", statuscode: 500 });
      }
    },

    // RESTORE 
    async restore(req, res) {
      try {
        const record = await Model.findByPk(req.params.id, { paranoid: false });
        if (!record)
          return res.status(404).json({ success: false, message: "Not found", statuscode: 404 });

        await record.restore();
        return res.status(200).json({ success: true, message: "Restored", statuscode: 200 });
      } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Server Error", statuscode: 500 });
      }
    },

    // FORCE DELETE
    async forceDelete(req, res) {
      try {
        const record = await Model.findByPk(req.params.id, { paranoid: false });
        if (!record)
          return res.status(404).json({ success: false, message: "Not found", statuscode: 404 });

        await record.destroy({ force: true });
        return res.status(200).json({
          success: true,
          statuscode: 200,
          message: "Permanently deleted",
        });
      } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Server Error", statuscode: 500 });
      }
    },
  };
};

