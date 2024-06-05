import Task from "../models/task.model";
import { Request, Response } from "express";

// [GET] /api/v1/tasks/
export const index = async (req: Request, res: Response): Promise<void> => {
  try {
    interface Find {
      deleted: boolean;
      status?: string;
    }
    const find: Find = {
      deleted: false,
    };
    const pagination = {
      limit: 2,
      page: 1,
    };
    let skip = pagination.limit * (pagination.page - 1);
    if (req.query.status) {
      find.status = `${req.query.status}`;
    }
    const sort: any = {};
    if (req.body.sortKey && req.body.sortValue) {
      sort[`${req.body.sortKey}`] = `${req.body.sortValue}`;
    }

    const tasks = await Task.find(find)
      .sort(sort)
      .skip(skip)
      .limit(pagination.limit);
    res.json(tasks);
  } catch {
    res.json({
      code: 400,
      message: "Không thê lấy được danh sách công việc",
    });
  }
};

// [GET] /api/v1/tasks/detail/:id
export const detail = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id;
    const task = await Task.findOne({
      _id: id,
      deleted: false,
    });
    res.json({ task });
  } catch {
    res.json({
      code: 400,
      message: "Không thể lấy ra chi tiết công việc!",
    });
  }
};
