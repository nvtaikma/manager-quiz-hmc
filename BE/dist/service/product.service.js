"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const products_1 = __importDefault(require("../models/products"));
class ProductService {
    getProduct(_a) {
        return __awaiter(this, arguments, void 0, function* ({ id }) {
            const result = yield products_1.default.findById(id)
                .select("-__v -createdAt -updatedAt")
                .lean();
            return result;
        });
    }
    createProduct(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const newProduct = {
                    name: data.name,
                };
                console.log("newProduct", newProduct);
                const result = yield products_1.default.create(newProduct);
                console.log("result", result);
                if (!result) {
                    throw new Error("Failed to create product");
                }
                return JSON.parse(JSON.stringify(result));
            }
            catch (error) {
                console.error("Error creating product:", error);
                throw error;
            }
        });
    }
    deleteProduct(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const deletedProduct = yield products_1.default.findByIdAndUpdate(data.id, { status: "inactive" }, { new: true });
                return JSON.parse(JSON.stringify(deletedProduct));
            }
            catch (error) {
                throw error;
            }
        });
    }
    updateProduct(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield products_1.default.findByIdAndUpdate(data.id, data, {
                new: true,
            });
            return JSON.parse(JSON.stringify(result));
        });
    }
    getListProducts() {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield products_1.default.find({ status: "active" })
                .select("-__v -createdAt -updatedAt -status")
                .lean();
            return result;
        });
    }
}
exports.default = new ProductService();
