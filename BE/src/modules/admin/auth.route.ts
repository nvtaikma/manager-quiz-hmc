import { Router } from "express";
import { login, checkAuth } from "./auth.controller";
import { authAdmin } from "../../middlewares/authAdmin";

const router = Router();

// POST /api/auth/login
router.post("/login", login);

// GET /api/auth/check
router.get("/check", authAdmin as any, checkAuth);

export default router;
