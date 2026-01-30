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
const exam_1 = __importDefault(require("../models/exam"));
const question_1 = __importDefault(require("../models/question"));
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
    syncQuestionCounts(productId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // 1. Get all exams for this product
                const exams = yield exam_1.default.find({ productId });
                let totalQuestions = 0;
                const updatedExams = [];
                // 2. Iterate through each exam
                for (const exam of exams) {
                    // Count questions for this exam
                    const count = yield question_1.default.countDocuments({ examId: exam._id });
                    // Update exam with new count
                    yield exam_1.default.findByIdAndUpdate(exam._id, { count });
                    updatedExams.push(Object.assign(Object.assign({}, exam.toObject()), { count }));
                    // Add to total if exam is active (optional logic, but usually total counts everything available)
                    // Or should we count everything? Let's count everything for now to reflect true data size
                    // If we only want 'active' questions, we should filter questions or exams.
                    // Requirement says "Update countQuestion field in Product", usually means total capacity.
                    totalQuestions += count;
                }
                // 3. Update Product with total count
                const updatedProduct = yield products_1.default.findByIdAndUpdate(productId, { countQuestion: totalQuestions }, { new: true });
                return {
                    product: updatedProduct,
                    exams: updatedExams,
                };
            }
            catch (error) {
                console.error("Error syncing question counts:", error);
                throw error;
            }
        });
    }
}
exports.default = new ProductService();
