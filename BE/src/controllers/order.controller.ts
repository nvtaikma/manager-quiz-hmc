import { Request, Response } from "express";
import OrderService from "../service/order.service";

type enumStatus = "pending" | "completed" | "cancelled";
class OrderController {
  async getOrder(req: Request, res: Response) {
    const { id } = req.params as { id: string };
    const order = await OrderService.getOrder(id);
    return res.status(200).json({
      message: "Order fetched successfully",
      data: order,
    });
  }

  async createOrder(req: Request, res: Response) {
    const { customerId, items } = req.body;
    const order = await OrderService.createOrder({ customerId, items });
    return res.status(200).json({
      message: "Order created successfully",
      data: order,
    });
  }

  async updateOrder(req: Request, res: Response) {
    const { id } = req.params as { id: string };
    const { customerId, items } = req.body as {
      customerId: string;
      items: { productId: string; selectedType: string }[];
    };
    const order = await OrderService.updateOrder({ id, customerId, items });
    return res.status(200).json({
      message: "Order updated successfully",
      data: order,
    });
  }

  async updateStatusOrder(req: Request, res: Response) {
    const { id } = req.params as { id: string };
    const { status } = req.body as { status: string };
    const order = await OrderService.updateStatusOrder(id, status);
    return res.status(200).json({
      message: "Order status updated successfully",
      data: order,
    });
  }

  async getListOrders(req: Request, res: Response) {
    const { page } = req.query as unknown as { page: number };
    const { userId, productId } = req.query as unknown as {
      userId: string;
      productId: string;
    };
    const orders = await OrderService.getListOrder({
      page,
      userId,
      productId,
    });
    return res.status(200).json({
      message: "Order list fetched successfully",
      data: orders,
    });
  }

  // async getListOrderByUser(req: Request, res: Response) {
  //   const { userId } = req.query as { userId: string };
  //   const { page } = req.query as unknown as { page: number };
  //   const orders = await OrderService.getListOrderByUser(userId, page);
  //   return res.status(200).json({
  //     message: "Order list fetched successfully",
  //     data: orders,
  //   });
  // }

  // async getListOrderByProduct(req: Request, res: Response) {
  //   const { productId } = req.query as { productId: string };
  //   const { page } = req.query as unknown as { page: number };
  //   const orders = await OrderService.getListOrderByProduct(productId, page);
  //   return res.status(200).json({
  //     message: "Order list fetched successfully",
  //     data: orders,
  //   });
  // }
  async getTotalAmountOrderByStatusSuccess(req: Request, res: Response) {
    const totalAmount = await OrderService.getTotalAmountOrderByStatusSuccess();
    return res.status(200).json({
      message: "Total amount order fetched successfully",
      data: totalAmount,
    });
  }

  async getTotalAmountOrderByDate(req: Request, res: Response) {
    const totalAmount = await OrderService.getTotalAmountOrderByDate();
    return res.status(200).json({
      message: "Total amount order fetched successfully",
      data: totalAmount,
    });
  }

  async getCountOrder(req: Request, res: Response) {
    const count = await OrderService.getCountOrder();
    return res.status(200).json({
      message: "Count order fetched successfully",
      data: { count },
    });
  }

  async getCountOrderByStatus(req: Request, res: Response) {
    const { status } = req.query as { status: enumStatus };
    const count = await OrderService.getCountOrderByStatus(status);
    return res.status(200).json({
      message: "Count order fetched successfully",
      data: { count },
    });
  }

  async getTotalAmountLast7Days(req: Request, res: Response) {
    const totalAmount = await OrderService.getTotalAmountLast7Days();
    return res.status(200).json({
      message: "Total amount order fetched successfully",
      data: totalAmount,
    });
  }

  async getTotalAmountLast12Months(req: Request, res: Response) {
    const totalAmount = await OrderService.getTotalAmountLast12Months();
    return res.status(200).json({
      message: "Total amount order fetched successfully",
      data: totalAmount,
    });
  }

  async getTotalAmountYesterday(req: Request, res: Response) {
    const totalAmount = await OrderService.getTotalAmountYesterday();
    return res.status(200).json({
      message: "Total amount order fetched successfully",
      data: totalAmount,
    });
  }

  async getOrderByEmail(req: Request, res: Response) {
    const { email } = req.query as { email: string };
    const orders = await OrderService.getOrderByEmail(email);
    return res.status(200).json({
      message: "Order list fetched successfully",
      data: orders,
    });
  }
}

export default new OrderController();
