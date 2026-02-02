import mongoose, { Schema, Document } from "mongoose";

export interface ITimetable extends Document {
  buoi: string;
  ngay_hoc: Date;
  giang_duong: string;
  dia_diem: string;
  doi_tuong: string;
  ten_lop: string;
  mon_hoc: string;
  loai_gio: string;
  so_tiet: string;
  giang_vien: string;
  sdt_gv: string;
  noi_dung: string;
  gio_thi: string;
  ghi_chu: string;
  createdAt: Date;
  updatedAt: Date;
}

const TimetableSchema: Schema = new Schema(
  {
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
  },
  {
    timestamps: true,
  }
);

// Index to help with deleting scheduling for a specific class
TimetableSchema.index({ ten_lop: 1 });
TimetableSchema.index({ ngay_hoc: 1 });

export default mongoose.model<ITimetable>("Timetable", TimetableSchema);
