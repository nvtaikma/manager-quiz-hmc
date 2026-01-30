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
const student_1 = __importDefault(require("../models/student"));
class StudentsService {
    createStudent(_a) {
        return __awaiter(this, arguments, void 0, function* ({ email, productId, }) {
            const normalizedEmail = email.toLowerCase();
            try {
                const student = yield student_1.default.findOneAndUpdate({ email: normalizedEmail, productId }, { email: normalizedEmail, productId }, { new: true, upsert: true }).lean();
                console.log("student", student);
                if (student &&
                    student.createdAt.getTime() !== student.updatedAt.getTime()) {
                    return {
                        message: "User already in the class",
                    };
                }
                return {
                    student,
                };
            }
            catch (error) {
                console.error("Error creating/finding student:", error);
                throw error;
            }
        });
    }
    getListStudentByProductId(productId_1) {
        return __awaiter(this, arguments, void 0, function* (productId, page = 1) {
            const limit = 15;
            const skip = (page - 1) * limit;
            const [students, total] = yield Promise.all([
                student_1.default.find({ productId })
                    .sort({ createdAt: -1 })
                    .select("-__v -createdAt -updatedAt")
                    .skip(skip)
                    .limit(limit)
                    .lean(),
                student_1.default.countDocuments({ productId }),
            ]);
            console.log("students", students);
            console.log("total", total);
            return {
                students,
                pagination: {
                    total,
                    page,
                    totalPages: Math.ceil(total / limit),
                },
            };
        });
    }
    getAllStudent(_a) {
        return __awaiter(this, arguments, void 0, function* ({ status, page = 1, // Gán giá trị mặc định trực tiếp trong cấu trúc tham số
        limit = 15, // Gán giá trị mặc định trực tiếp trong cấu trúc tham số
         }) {
            // Đặt page và limit là optional (?) trong type
            // Đảm bảo page và limit là số dương, tránh lỗi hoặc truy vấn không hợp lệ
            const currentPage = Math.max(1, page);
            const currentLimit = Math.max(1, limit);
            // Tạo filter object
            const filter = { status };
            // Thực hiện truy vấn
            const [students, total] = yield Promise.all([
                student_1.default.aggregate([
                    { $match: filter },
                    { $project: { __v: 0, createdAt: 0, updatedAt: 0 } },
                    {
                        $lookup: {
                            from: "products",
                            localField: "productId",
                            foreignField: "_id",
                            as: "product",
                        },
                    },
                    { $unwind: "$product" },
                    {
                        $project: {
                            email: 1,
                            productId: 1,
                            status: 1,
                            product: { name: 1, _id: 1 },
                        },
                    },
                    { $sort: { createdAt: -1 } },
                    { $skip: (currentPage - 1) * currentLimit },
                    { $limit: currentLimit },
                ]),
                student_1.default.countDocuments(filter),
            ]);
            return {
                students,
                pagination: {
                    total,
                    page: currentPage,
                    limit: currentLimit,
                    totalPages: Math.ceil(total / currentLimit),
                },
            };
        });
    }
    // Sử dụng studentId trong tham số để khớp với logic tìm kiếm
    updateStudentStatus(studentId, status) {
        return __awaiter(this, void 0, void 0, function* () {
            // Tạo đối tượng cập nhật
            const update = { status };
            // Thực hiện tìm kiếm theo ID và cập nhật trạng thái,
            // { new: true } đảm bảo trả về document sau khi đã được cập nhật
            const updatedStudent = yield student_1.default.findByIdAndUpdate(studentId, update, {
                new: true,
            });
            return updatedStudent;
        });
    }
    getStudentByEmailAndProductId(email, productId) {
        return __awaiter(this, void 0, void 0, function* () {
            const normalizedEmail = email.toLowerCase();
            return yield student_1.default.findOne({ email: normalizedEmail, productId }).lean();
        });
    }
    deleteStudent(studentId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield student_1.default.findByIdAndDelete(studentId);
        });
    }
    exprireOldStudent() {
        return __awaiter(this, void 0, void 0, function* () {
            // Tính toán thời điểm 90 ngày trước (Expiration Threshold)
            const expirationThreshold = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
            console.log(`Bắt đầu kiểm tra học sinh cũ hơn: ${expirationThreshold.toISOString()}`);
            // Định nghĩa bộ lọc tìm kiếm
            const filter = {
                // 1. Chỉ xem xét các trạng thái chưa hết hạn
                status: { $in: ["completed", "pending"] },
                // 2. Tìm kiếm những bản ghi được tạo TRƯỚC thời điểm 90 ngày trước
                createdAt: { $lt: expirationThreshold },
            };
            // Định nghĩa hành động cập nhật
            const update = {
                status: "expired",
            };
            try {
                // Sử dụng updateMany để cập nhật nhiều bản ghi cùng lúc (RẤT HIỆU QUẢ)
                const result = yield student_1.default.updateMany(filter, update);
                console.log(`Đã hoàn tất cập nhật trạng thái. Tổng số document được tìm thấy: ${result.matchedCount}, đã cập nhật: ${result.modifiedCount}`);
                return {
                    matchedCount: result.matchedCount,
                    modifiedCount: result.modifiedCount,
                };
            }
            catch (error) {
                console.error("Lỗi khi cập nhật trạng thái hết hạn cho học sinh:", error);
                throw error;
            }
        });
    }
    deleteStudentByProductIdAndEmail(productId, email) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield student_1.default.findOneAndDelete({ productId, email });
        });
    }
    searchStudentByProductId(keyword_1, productId_1) {
        return __awaiter(this, arguments, void 0, function* (keyword, productId, page = 1) {
            const limit = 15;
            const skip = (page - 1) * limit;
            const [students, total] = yield Promise.all([
                student_1.default.find({
                    $or: [{ email: { $regex: keyword, $options: "i" } }],
                    productId,
                })
                    .select("-__v -createdAt -updatedAt")
                    .skip(skip)
                    .limit(limit)
                    .lean(),
                student_1.default.countDocuments({
                    $or: [{ email: { $regex: keyword, $options: "i" } }],
                    productId,
                }),
            ]);
            return {
                students,
                pagination: {
                    total,
                    page,
                    totalPages: Math.ceil(total / limit),
                },
            };
        });
    }
    getCountStudentByProductId(productId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield student_1.default.countDocuments({ productId });
        });
    }
    /**
     * Lấy danh sách đề thi của sinh viên theo khóa học
     * @param studentId ID của sinh viên
     * @param productId ID của khóa học
     * @returns Danh sách đề thi
     */
    getStudentExams(studentId, productId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Xác nhận sinh viên tồn tại và có quyền truy cập khóa học
                const student = yield student_1.default.findOne({ _id: studentId, productId });
                if (!student) {
                    throw new Error("Sinh viên không có quyền truy cập khóa học này");
                }
                // Giả định rằng có một model Exam với cấu trúc phù hợp
                // Bạn cần thay thế đoạn này bằng truy vấn thực tế đến model Exam của bạn
                // Ví dụ:
                // const exams = await Exam.find({ productId }).lean();
                // Hiện tại trả về dữ liệu mẫu
                return {
                    exams: [],
                    message: "Cần triển khai kết nối với model Exam thực tế",
                };
            }
            catch (error) {
                console.error("Error fetching student exams:", error);
                throw error;
            }
        });
    }
    /**
     * Lấy danh sách bài kiểm tra của sinh viên theo khóa học
     * @param studentId ID của sinh viên
     * @param productId ID của khóa học
     * @returns Danh sách bài kiểm tra
     */
    getStudentTests(studentId, productId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Xác nhận sinh viên tồn tại và có quyền truy cập khóa học
                const student = yield student_1.default.findOne({ _id: studentId, productId });
                if (!student) {
                    throw new Error("Sinh viên không có quyền truy cập khóa học này");
                }
                // Giả định rằng có một model Test với cấu trúc phù hợp
                // Bạn cần thay thế đoạn này bằng truy vấn thực tế đến model Test của bạn
                // Ví dụ:
                // const tests = await Test.find({ productId }).lean();
                // Hiện tại trả về dữ liệu mẫu
                return {
                    tests: [],
                    message: "Cần triển khai kết nối với model Test thực tế",
                };
            }
            catch (error) {
                console.error("Error fetching student tests:", error);
                throw error;
            }
        });
    }
}
exports.default = new StudentsService();
