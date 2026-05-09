import { Request, Response } from "express";
import { applyWatermark } from "../util/watermark";
import { responseError } from "../util/errorhandler";

// URL Google Apps Script để upload ảnh lên Google Drive
const GOOGLE_APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbwvWbfkZhCzHxru2euDalTHdjvtgKn4vOYEDFlwiyHS6nj53_WKKLf3x_XGHsa1Bj1gHA/exec";

class UploadController {
  /**
   * Upload ảnh có chèn watermark "testhmc.site"
   *
   * Flow:
   * 1. Nhận file ảnh từ request (multipart/form-data qua multer)
   * 2. Chèn watermark bằng sharp
   * 3. Chuyển thành base64 và gửi lên Google Apps Script
   * 4. Trả về link ảnh từ Google Drive
   */
  async uploadImage(req: Request, res: Response) {
    try {
      const file = req.file;
      if (!file) {
        return responseError(res, "Không tìm thấy file ảnh trong request", 400);
      }

      // Kiểm tra kích thước (5MB)
      if (file.size > 5 * 1024 * 1024) {
        return responseError(
          res,
          "Kích thước ảnh không được vượt quá 5MB",
          400
        );
      }

      // Kiểm tra định dạng
      const validTypes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
      ];
      if (!validTypes.includes(file.mimetype)) {
        return responseError(
          res,
          "Chỉ hỗ trợ định dạng ảnh: JPG, PNG, GIF, WEBP",
          400
        );
      }

      // 1. Chèn watermark
      const watermarkedBuffer = await applyWatermark(file.buffer);

      // 2. Chuyển sang base64 để gửi lên Google Apps Script
      const base64Data = watermarkedBuffer.toString("base64");

      const postData = {
        name: file.originalname,
        type: file.mimetype,
        data: base64Data,
      };

      // 3. Gửi lên Google Apps Script
      const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
        method: "POST",
        body: JSON.stringify(postData),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(
          `Google Apps Script trả về lỗi: ${response.status} ${response.statusText}`
        );
      }

      const responseData = await response.json();

      if (!responseData.link) {
        throw new Error("Không nhận được link ảnh từ Google Apps Script");
      }

      return res.status(200).json({
        message: "Upload ảnh thành công (đã chèn watermark)",
        data: {
          link: responseData.link,
        },
      });
    } catch (error: any) {
      console.error("Lỗi upload ảnh:", error.message);
      return responseError(
        res,
        error.message || "Không thể upload ảnh. Vui lòng thử lại.",
        500
      );
    }
  }
}

export default new UploadController();
