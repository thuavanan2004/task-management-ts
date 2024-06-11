import express, { Router } from "express";
const router: Router = express.Router();

import * as controller from "../controllers/user.controller";

router.post("/register", controller.register);

router.post("/login", controller.login);

router.post("/token", controller.refreshAccessToken);

export const userRouters: Router = router;
