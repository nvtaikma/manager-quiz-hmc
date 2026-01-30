import { Request, Response } from "express";
import examService from "../service/exam.service";
import { responseError } from "../util/errorhandler";
import announcementService from "../service/announcement.service";

class AnnouncementController {
  /**
   * create announcement
   */
  async createAnnouncement(req: Request, res: Response) {
    const announcementData = req.body;
    const announcement = await announcementService.createAnnouncement(
      announcementData
    );
    return res.status(200).json({
      message: "Announcement created successfully",
      data: announcement,
    });
  }

  /**
   * get announcement
   */
  async getAnnouncement(req: Request, res: Response) {
    const { id } = req.params;
    const announcement = await announcementService.getAnnouncement(id);
    return res.status(200).json({
      message: "Announcement fetched successfully",
      data: announcement,
    });
  }

  /**
   * update announcement
   */
  async updateAnnouncement(req: Request, res: Response) {
    const { id } = req.params;
    const announcementData = req.body;
    const announcement = await announcementService.updateAnnouncement(
      id,
      announcementData
    );
    return res.status(200).json({
      message: "Announcement updated successfully",
      data: announcement,
    });
  }

  /**
   * delete announcement
   */
  async deleteAnnouncement(req: Request, res: Response) {
    const { id } = req.params;
    const announcement = await announcementService.deleteAnnouncement(id);
    return res.status(200).json({
      message: "Announcement deleted successfully",
      data: announcement,
    });
  }

  /**
   * get all announcements
   */
  async getAllAnnouncements(req: Request, res: Response) {
    const { page, limit } = req.query as { page: string; limit: string };
    const pageNumber = Number(page) || 1;
    const limitNumber = Number(limit) || 15;
    const announcements = await announcementService.getAllAnnouncements(
      pageNumber,
      limitNumber
    );
    return res.status(200).json({
      message: "Announcements fetched successfully",
      data: announcements,
    });
  }

  /**
   * get all active announcements
   */
  async getAllActiveAnnouncements(req: Request, res: Response) {
    const announcements = await announcementService.getAllActiveAnnouncements();
    return res.status(200).json({
      message: "Active announcements fetched successfully",
      data: announcements,
    });
  }

  /**
   * get all expired announcements
   */
  async getAllExpiredAnnouncements(req: Request, res: Response) {
    const announcements =
      await announcementService.getAllExpiredAnnouncements();
    return res.status(200).json({
      message: "Expired announcements fetched successfully",
      data: announcements,
    });
  }
}

export default new AnnouncementController();
