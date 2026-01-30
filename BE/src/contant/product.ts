import { Request } from "express";
import { ParamsDictionary } from "express-serve-static-core";
type ProductRequestBody = {
  name: string;
};

type ProductRequest = Request<any, any, ProductRequestBody>;

type UpdateProductRequestBody = {
  name: string;
  image?: string;
  countQuestion?: number;
  documentId?: string;
};
type UpdateProductRequest = Request<
  ParamsDictionary,
  any,
  UpdateProductRequestBody
>;

type DeleteProductRequestParam = { id: string };
type DeleteProductRequest = Request<any, any, DeleteProductRequestParam>;

export {
  ProductRequestBody,
  ProductRequest,
  UpdateProductRequest,
  DeleteProductRequestParam,
  DeleteProductRequest,
  UpdateProductRequestBody,
};
