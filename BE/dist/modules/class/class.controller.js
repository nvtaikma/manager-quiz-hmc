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
const class_service_1 = __importDefault(require("./class.service"));
class ClassController {
    getClasses(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const classes = yield class_service_1.default.getAllClasses();
                res.status(200).json({
                    message: "Get classes success",
                    data: classes,
                });
            }
            catch (error) {
                res.status(500).json({ message: error.message });
            }
        });
    }
    bulkCreateClasses(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { classes } = req.body;
                const result = yield class_service_1.default.bulkCreateClasses(classes);
                res.status(200).json({
                    message: "Bulk create classes success",
                    data: result,
                });
            }
            catch (error) {
                res.status(500).json({ message: error.message });
            }
        });
    }
    getTimetable(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { className } = req.params;
                const timetable = yield class_service_1.default.getTimetableByClass(className);
                // Get class metadata (lastTimetableUpdate)
                // Since ClassService doesn't export the Model directly in a clean way via service methods yet, 
                // we should ideally add a method in Service. But for quick win, let's assume ClassService can do it.
                // Or import the Model here. Let's ask Service to do it.
                const classInfo = yield class_service_1.default.getClassByName(className);
                res.status(200).json({
                    message: "Get timetable success",
                    data: timetable,
                    meta: classInfo
                });
            }
            catch (error) {
                res.status(500).json({ message: error.message });
            }
        });
    }
    importTimetable(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const data = req.body; // Expect array of timetable objects
                const result = yield class_service_1.default.importTimetable(data);
                res.status(200).json({
                    message: "Import timetable success",
                    data: result,
                });
            }
            catch (error) {
                res.status(500).json({ message: error.message });
            }
        });
    }
    importTimetableForClass(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { className } = req.params;
                const data = req.body;
                // Pass className to service for validation
                const result = yield class_service_1.default.importTimetable(data, className);
                res.status(200).json({
                    message: "Import timetable success",
                    data: result,
                });
            }
            catch (error) {
                res.status(500).json({ message: error.message });
            }
        });
    }
}
exports.default = new ClassController();
