import { Request, Response } from "express";
import ProductService from "../service/product.service";
import {
  DeleteProductRequest,
  DeleteProductRequestParam,
  ProductRequest,
  ProductRequestBody,
  UpdateProductRequest,
  UpdateProductRequestBody,
} from "../contant/product";
import { responseSuccess } from "../util/errorhandler";

class ProductController {
  async createProduct(req: ProductRequest, res: Response) {
    const body = req.body as ProductRequestBody;
    console.log("body", body);
    const product = await ProductService.createProduct(body);
    return responseSuccess(res, product);
  }

  async getProductById(req: Request, res: Response) {
    const id = req.params.id as string;
    const product = await ProductService.getProduct({ id });
    return res.json({
      message: "Product fetched successfully",
      data: product,
    });
  }

  async getListProducts(req: Request, res: Response) {
    const products = await ProductService.getListProducts();
    return res.json({
      message: "Products fetched successfully",
      data: products,
    });
  }

  async updateProduct(req: UpdateProductRequest, res: Response) {
    const id = req.params.id as string;
    const body = req.body as UpdateProductRequestBody;

    const product = await ProductService.updateProduct({
      id,
      ...body,
    });
    return responseSuccess(res, product);
  }
  async deleteProduct(req: DeleteProductRequest, res: Response) {
    const data = req.params;
    const product = await ProductService.deleteProduct(data);
    return responseSuccess(res, product);
  }
}

export default ProductController;
