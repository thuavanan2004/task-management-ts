import { taskRouters } from "./task.route";
import { userRouters } from "./user.route";
import { Express } from "express";
import { requireAuth } from "../middlewares/auth.middleware";

export const v1Route = (app: Express) => {
  const version = "/api/v1";

  app.use(version + "/tasks", requireAuth, taskRouters);

  app.use(version + "/users", userRouters);
};
