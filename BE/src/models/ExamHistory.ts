import mongoose, { Document, Schema } from "mongoose";

// Interface cho ExamHistory
export interface IExamHistory extends Document {
  examId: mongoose.Types.ObjectId;
  examName: string;
  userId: mongoose.Types.ObjectId;
  score: number;
  totalQuestions: number;
  duration: number; // Thời gian làm bài (giây)
  examType: "quizizz" | "google-form"; // Loại bài thi
  completedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Schema cho ExamHistory
const ExamHistorySchema: Schema = new Schema(
  {
    examId: { type: Schema.Types.ObjectId, ref: "Exam", required: true },
    examName: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    score: { type: Number, required: true },
    totalQuestions: { type: Number, required: true },
    duration: { type: Number, required: true }, // Thời gian làm bài (giây)
    examType: {
      type: String,
      enum: ["quizizz", "google-form"],
      required: true,
    },
    completedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Model cho ExamHistory
export default mongoose.model<IExamHistory>("ExamHistory", ExamHistorySchema);
