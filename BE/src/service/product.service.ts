import {
  DeleteProductRequestParam,
  ProductRequestBody,
} from "../contant/product";
import Product from "../models/products";

class ProductService {
  async getProduct({ id }: { id: string }) {
    const result = await Product.findById(id)
      .select("-__v -createdAt -updatedAt")
      .lean();
    return result;
  }
  async createProduct(data: ProductRequestBody) {
    try {
      const newProduct = {
        name: data.name,
      };
      console.log("newProduct", newProduct);
      const result = await Product.create(newProduct);
      console.log("result", result);
      if (!result) {
        throw new Error("Failed to create product");
      }
      return JSON.parse(JSON.stringify(result));
    } catch (error) {
      console.error("Error creating product:", error);
      throw error;
    }
  }

  async deleteProduct(data: DeleteProductRequestParam) {
    try {
      const deletedProduct = await Product.findByIdAndUpdate(
        data.id,
        { status: "inactive" },
        { new: true }
      );
      return JSON.parse(JSON.stringify(deletedProduct));
    } catch (error) {
      throw error;
    }
  }

  async updateProduct(data: {
    id: string;
    name: string;
    image?: string;
    countQuestion?: number;
    documentId?: string;
  }) {
    const result = await Product.findByIdAndUpdate(data.id, data, {
      new: true,
    });
    return JSON.parse(JSON.stringify(result));
  }

  async getListProducts() {
    const result = await Product.find({ status: "active" })
      .select("-__v -createdAt -updatedAt -status")
      .lean();
    return result;
  }
}

export default new ProductService();
