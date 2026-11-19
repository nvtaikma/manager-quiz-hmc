import { Router } from "express";
import { login, checkAuth, changePassword } from "./auth.controller";
import { authAdmin } from "../../middlewares/authAdmin";

const router = Router();

// POST /api/auth/login
router.post("/login", login);

// GET /api/auth/check
router.get("/check", authAdmin as any, checkAuth);

// POST /api/auth/change-password
router.post("/change-password", authAdmin as any, changePassword);

export default router;

