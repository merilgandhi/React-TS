import { Request, Response, NextFunction } from 'express';

export const pagination = (req, res, next) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;

  req.pagination = {
    page,
    limit,
    offset: (page - 1) * limit
  };

  next();
};
