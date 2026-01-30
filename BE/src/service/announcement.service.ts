import { Schema } from "mongoose";
import Announcement from "../models/Announcement";
import { responseError } from "../util/errorhandler";

interface AnnouncementData {
  location: string;
  message: string;
  isActive: boolean;
  expiresAt: Date;
  priority: number;
}

class AnnouncementService {
  // create announcement
  async createAnnouncement(announcementData: AnnouncementData) {
    const announcement = await Announcement.create(announcementData);
    const result = {
      id: announcement._id,
      location: announcement.location,
      message: announcement.message,
      isActive: announcement.isActive,
      expiresAt: announcement.expiresAt,
      priority: announcement.priority,
    };
    return result;
  }

  // get announcement
  async getAnnouncement(id: string) {
    const announcement = await Announcement.findById(id);
    if (!announcement) {
      throw new Error("Announcement not found");
    }
    const result = {
      id: announcement._id,
      location: announcement.location,
      message: announcement.message,
      isActive: announcement.isActive,
      expiresAt: announcement.expiresAt,
      priority: announcement.priority,
    };
    return result;
  }

  // update announcement
  async updateAnnouncement(id: string, announcementData: AnnouncementData) {
    const announcement = await Announcement.findOneAndUpdate(
      { _id: id },
      announcementData,
      { new: true }
    );
    if (!announcement) {
      throw new Error("Announcement not found");
    }
    const result = {
      id: announcement._id,
      location: announcement.location,
      message: announcement.message,
      isActive: announcement.isActive,
      expiresAt: announcement.expiresAt,
      priority: announcement.priority,
    };
    return result;
  }

  // delete announcement
  async deleteAnnouncement(id: string) {
    const announcement = await Announcement.findByIdAndDelete(id);
    if (!announcement) {
      throw new Error("Announcement not found");
    }
    return announcement;
  }

  // get all announcements
  async getAllAnnouncements(page: number = 1, limit: number = 15) {
    const announcements = await Announcement.find()
      .skip((page - 1) * limit)
      .limit(limit);
    const total = await Announcement.countDocuments();
    return {
      announcements,
      pagination: {
        total,
        page,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // get all active announcements
  async getAllActiveAnnouncements() {
    const announcements = await Announcement.find({ isActive: true });
    return announcements;
  }

  // get all expired announcements
  async getAllExpiredAnnouncements() {
    const announcements = await Announcement.find({
      expiresAt: { $lt: new Date() },
    });
    return announcements;
  }
}

export default new AnnouncementService();
