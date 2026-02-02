import { Request, Response } from "express";
import CustomersService from "../service/customers.service";

class CustomerController {
  async createCustomer(req: Request, res: Response) {
    const { name, email } = req.body as { name: string; email: string };
    const customer = await CustomersService.createCustomer({
      name,
      email,
    });
    return res.json({
      message: "Customer created successfully",
      data: customer,
    });
  }

  async getListCustomer(req: Request, res: Response) {
    const { page } = req.query as unknown as { page: number };
    const customers = await CustomersService.getListCustomer(page);
    return res.json({
      message: "Customer list fetched successfully",
      data: customers,
    });
  }

  async updateCustomer(req: Request, res: Response) {
    const { id } = req.params as { id: string };
    const { name, email } = req.body as { name: string; email: string };
    const customer = await CustomersService.updateCustomer({ id, name, email });
    return res.json({
      message: "Customer updated successfully",
      data: customer,
    });
  }

  async updateStatusCustomer(req: Request, res: Response) {
    const { id } = req.params as { id: string };
    const { status } = req.query as { status: "active" | "inactive" };
    const customer = await CustomersService.updateStatusCustomer(id, status);
    return res.json({
      message: "Customer status updated successfully",
      data: customer,
    });
  }

  async getCountCustomerActive(req: Request, res: Response) {
    const count = await CustomersService.getCountCustomerActive();
    return res.json({
      message: "Count customer active fetched successfully",
      data: { count },
    });
  }

  async getCountCustomerInactive(req: Request, res: Response) {
    const count = await CustomersService.getCountCustomerInactive();
    return res.json({
      message: "Count customer inactive fetched successfully",
      data: { count },
    });
  }

  async searchCustomer(req: Request, res: Response) {
    const { keyword } = req.query as { keyword: string };
    const { page } = req.query as unknown as { page: number };
    const customers = await CustomersService.searchCustomer(keyword, page);
    return res.json({
      message: "Customer list fetched successfully",
      data: customers,
    });
  }

  async getCustomerSession(req: Request, res: Response) {
    const { id } = req.params as { id: string };
    const session = await CustomersService.getCustomerSession(id);
    return res.json({
      message: "Customer session fetched successfully",
      data: session,
    });
  }
}

export default new CustomerController();
