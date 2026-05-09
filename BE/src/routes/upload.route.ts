import express from "express";
import multer from "multer";
import uploadController from "../controllers/upload.controller";
import asyncHandler from "../util/asynHandler";

const router = express.Router();

// Cấu hình multer: lưu file trong memory (buffer) để xử lý watermark
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (_req, file, cb) => {
    const validTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    if (validTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Chỉ hỗ trợ định dạng ảnh: JPG, PNG, GIF, WEBP"));
    }
  },
});

// POST /api/upload/image - Upload ảnh có watermark
router.post(
  "/image",
  upload.single("image"),
  asyncHandler(uploadController.uploadImage)
);

export default router;
