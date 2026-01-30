import { Request, Response } from "express";
import SessionService from "../service/Session.service";

class SessionController {
  async getSessionByUserId(req: Request, res: Response) {
    const { userId } = req.params;
    const session = await SessionService.getSessionByUserId({ userId });

    return res.status(200).json({
      message: "Success",
      data: session,
    });
  }
}

export default new SessionController();
