import "express";

declare module "express" {
  export interface Request {
    pagination?: {
      page: number;
      limit: number;
      offset: number;
    };
  }
}
