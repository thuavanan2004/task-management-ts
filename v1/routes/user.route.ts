import express, { Router } from "express";
const router: Router = express.Router();

import * as controller from "../controllers/user.controller";

router.post("/register", controller.register);

router.post("/login", controller.login);

router.post("/refresh-token", controller.refreshToken);

router.get("/logout", controller.logout);

export const userRouters: Router = router;
