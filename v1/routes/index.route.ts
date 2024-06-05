import { taskRouters } from "./task.route";
import { Express } from "express";

export const v1Route = (app: Express) => {
  const version = "/api/v1";

  app.use(version + "/tasks", taskRouters);
};
