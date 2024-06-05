import express, { Router } from "express";

const router: Router = express.Router();
import * as controller from "../controllers/task.controller";

router.get("/", controller.index);

router.get("/detail/:id", controller.detail);

export const taskRouters: Router = router;
