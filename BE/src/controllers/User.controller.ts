import { Request, Response } from "express";
import UserService from "../service/User.service";

class UserController {
  async getUserByEmail(req: Request, res: Response) {
    const { email } = req.params;
    const user = await UserService.getUserByEmail({ email });
    return res.status(200).json({
      message: "Success",
      data: user,
    });
  }
}

export default new UserController();
