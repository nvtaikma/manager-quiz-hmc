"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const TimetableSchema = new mongoose_1.Schema({
    buoi: { type: String, default: "" },
    ngay_hoc: { type: Date, required: true },
    giang_duong: { type: String, default: "" },
    dia_diem: { type: String, default: "" },
    doi_tuong: { type: String, default: "" },
    ten_lop: { type: String, required: true }, // Index for fast lookup by class
    mon_hoc: { type: String, default: "" },
    loai_gio: { type: String, default: "" },
    so_tiet: { type: String, default: "" },
    giang_vien: { type: String, default: "" },
    sdt_gv: { type: String, default: "" },
    noi_dung: { type: String, default: "" },
    gio_thi: { type: String, default: "" },
    ghi_chu: { type: String, default: "" },
}, {
    timestamps: true,
});
// Index to help with deleting scheduling for a specific class
TimetableSchema.index({ ten_lop: 1 });
TimetableSchema.index({ ngay_hoc: 1 });
exports.default = mongoose_1.default.model("Timetable", TimetableSchema);
