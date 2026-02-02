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
const class_models_1 = __importDefault(require("./class.models"));
const timetable_models_1 = __importDefault(require("./timetable.models"));
class ClassService {
    getAllClasses() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield class_models_1.default.find().sort({ name: 1 }).lean();
        });
    }
    bulkCreateClasses(classNames) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!classNames || classNames.length === 0)
                return [];
            // 1. Find classes that already exist
            const existingClasses = yield class_models_1.default.find({
                name: { $in: classNames }
            }).select("name").lean();
            const existingNames = new Set(existingClasses.map(c => c.name));
            // 2. Filter out existing classes
            const newClassNames = classNames.filter(name => !existingNames.has(name));
            if (newClassNames.length === 0) {
                return {
                    insertedCount: 0,
                    message: "No new classes to add. All classes already exist."
                };
            }
            // 3. Insert only new classes
            const classesToInsert = newClassNames.map(name => ({ name }));
            const result = yield class_models_1.default.insertMany(classesToInsert);
            return {
                insertedCount: result.length,
                insertedClasses: result
            };
        });
    }
    // Timetable Logic
    getTimetableByClass(className) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield timetable_models_1.default.find({ ten_lop: className }).sort({ ngay_hoc: 1, buoi: 1 }).lean();
        });
    }
    importTimetable(data, targetClassName) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!data || data.length === 0)
                return { message: "No data provided" };
            // 1. Identify distinct classes in the input data
            const classNames = [...new Set(data.map((item) => item.ten_lop).filter(Boolean))];
            if (classNames.length === 0) {
                throw new Error("Invalid data: Missing 'ten_lop' field");
            }
            // 1.1 If strictly importing for a specific class, validate congruency
            if (targetClassName) {
                const invalidClassNames = classNames.filter(name => name.trim() !== targetClassName.trim());
                if (invalidClassNames.length > 0) {
                    throw new Error(`Dữ liệu chứa lớp '${invalidClassNames.join(", ")}' không khớp với lớp đang chọn '${targetClassName}'.`);
                }
            }
            // 2. Parse dates
            const formattedData = data.map((item) => {
                const dateParts = item.ngay_hoc.split("/"); // "23/1/2026"
                let dateObj = new Date();
                if (dateParts.length === 3) {
                    // dd/mm/yyyy
                    dateObj = new Date(parseInt(dateParts[2]), parseInt(dateParts[1]) - 1, parseInt(dateParts[0]));
                }
                return Object.assign(Object.assign({}, item), { ngay_hoc: dateObj });
            });
            // 3. Delete old schedules for these classes
            yield timetable_models_1.default.deleteMany({ ten_lop: { $in: classNames } });
            // 4. Insert new schedules
            const result = yield timetable_models_1.default.insertMany(formattedData);
            return result;
        });
    }
}
exports.default = new ClassService();
