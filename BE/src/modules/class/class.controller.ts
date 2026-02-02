import { Request, Response } from "express";
import ClassService from "./class.service";

class ClassController {
  async getClasses(req: Request, res: Response) {
    try {
      const classes = await ClassService.getAllClasses();
      res.status(200).json({
        message: "Get classes success",
        data: classes,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async bulkCreateClasses(req: Request, res: Response) {
    try {
      const { classes } = req.body; 
      const result = await ClassService.bulkCreateClasses(classes);
      res.status(200).json({
        message: "Bulk create classes success",
        data: result,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async getTimetable(req: Request, res: Response) {
    try {
      const { className } = req.params;
      const timetable = await ClassService.getTimetableByClass(className);
      
      // Get class metadata (lastTimetableUpdate)
      // Since ClassService doesn't export the Model directly in a clean way via service methods yet, 
      // we should ideally add a method in Service. But for quick win, let's assume ClassService can do it.
      // Or import the Model here. Let's ask Service to do it.
      const classInfo = await ClassService.getClassByName(className);

      res.status(200).json({
        message: "Get timetable success",
        data: timetable,
        meta: classInfo
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async importTimetable(req: Request, res: Response) {
    try {
      const data = req.body; // Expect array of timetable objects
      const result = await ClassService.importTimetable(data);
      res.status(200).json({
        message: "Import timetable success",
        data: result,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async importTimetableForClass(req: Request, res: Response) {
    try {
      const { className } = req.params;
      const data = req.body; 
      // Pass className to service for validation
      const result = await ClassService.importTimetable(data, className);
      res.status(200).json({
        message: "Import timetable success",
        data: result,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
}

export default new ClassController();
