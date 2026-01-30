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
const product_service_1 = __importDefault(require("../service/product.service"));
const errorhandler_1 = require("../util/errorhandler");
class ProductController {
    createProduct(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const body = req.body;
            console.log("body", body);
            const product = yield product_service_1.default.createProduct(body);
            return (0, errorhandler_1.responseSuccess)(res, product);
        });
    }
    getProductById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id;
            const product = yield product_service_1.default.getProduct({ id });
            return res.json({
                message: "Product fetched successfully",
                data: product,
            });
        });
    }
    getListProducts(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const products = yield product_service_1.default.getListProducts();
            return res.json({
                message: "Products fetched successfully",
                data: products,
            });
        });
    }
    updateProduct(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id;
            const body = req.body;
            const product = yield product_service_1.default.updateProduct(Object.assign({ id }, body));
            return (0, errorhandler_1.responseSuccess)(res, product);
        });
    }
    deleteProduct(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = req.params;
            const product = yield product_service_1.default.deleteProduct(data);
            return (0, errorhandler_1.responseSuccess)(res, product);
        });
    }
    syncQuestionCounts(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const productId = req.params.id;
            const result = yield product_service_1.default.syncQuestionCounts(productId);
            return (0, errorhandler_1.responseSuccess)(res, "Synced question counts successfully", result);
        });
    }
}
exports.default = ProductController;
