import Task from "../models/task.model";
import { Request, Response } from "express";

// [GET] /api/v1/tasks/
export const index = async (req: Request, res: Response): Promise<void> => {
  try {
    interface Find {
      deleted: boolean;
      status?: string;
      title?: RegExp;
    }
    const find: Find = {
      deleted: false,
    };
    const pagination = {
      limit: 2,
      page: 1,
    };
    if (req.query.page) {
      pagination.page = parseInt(`${req.query.page}`);
    }
    const skip = pagination.limit * (pagination.page - 1);
    if (req.query.status) {
      find.status = `${req.query.status}`;
    }
    const sort: any = {};
    if (req.query.sortKey && req.query.sortValue) {
      sort[`${req.query.sortKey}`] = `${req.query.sortValue}`;
    }
    if (req.query.keyword) {
      const regex = new RegExp(`${req.query.keyword}`, "i");
      find.title = regex;
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

// [PATCH] /api/v1/tasks/change-status/:id
export const changeStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = req.params.id;
    const statusUpdate = req.body.status;
    await Task.updateOne(
      {
        _id: id,
      },
      {
        status: statusUpdate,
      }
    );
    res.json("Cập nhật trạng thái công việc thành công!");
  } catch {
    res.json("Cập nhật trạng thái công việc không thành công!");
  }
};

// [PATCH] /api/v1/tasks/change-multi
export const changeMulti = async (
  req: Request,
  res: Response
): Promise<void> => {
  const ids = req.body.ids;
  const statusUpdate = req.body.status;
  await Task.updateMany(
    {
      _id: { $in: ids },
    },
    {
      status: statusUpdate,
    }
  );

  res.json({
    code: 200,
    message: "Cập nhật trạng thái thành công!",
  });
};

// [POST] /api/v1/tasks/create
export const create = async (req: Request, res: Response): Promise<void> => {
  const task = req.body;
  const record = new Task(task);
  await record.save();
  res.json({
    code: 200,
    task: task,
  });
};

// [PATCH] /api/v1/tasks/edit/:id
export const edit = async (req: Request, res: Response): Promise<void> => {
  const id: string = req.params.id;
  const data = req.body;
  await Task.updateOne(
    {
      _id: id,
    },
    data
  );

  res.json({
    code: 200,
    message: "Chỉnh sửa công việc thành công!",
  });
};

// [PATCH] /api/v1/tasks/delete/:id
export const deleteTask = async (
  req: Request,
  res: Response
): Promise<void> => {
  const id = req.params.id;
  await Task.updateOne(
    {
      _id: id,
    },
    {
      deleted: true,
    }
  );
  res.json({
    code: "Xóa một công việc thành công!",
  });
};

// [PATCH] /api/v1/tasks/delete-multi
export const deleteMulti = async (
  req: Request,
  res: Response
): Promise<void> => {
  const ids = req.body.ids;
  await Task.updateMany(
    {
      _id: { $in: ids },
    },
    {
      deleted: true,
    }
  );

  res.json({
    code: 200,
    message: "Xóa nhiều công việc thành công!",
  });
};
