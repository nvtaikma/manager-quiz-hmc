import mongoose, { Document, Schema } from "mongoose";

// Interface cho PracticeExamHistory
export interface IPracticeExamHistory extends Document {
  courseId: mongoose.Types.ObjectId;
  courseName: string;
  userId: mongoose.Types.ObjectId;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  duration: number; // Thời gian làm bài (giây)
  practiceType: "course-review"; // Loại thi thử (có thể mở rộng sau)
  status: "in_progress" | "completed" | "time_up" | "abandoned"; // Trạng thái bài thi
  selectedQuestions: Array<{
    questionId: mongoose.Types.ObjectId;
    answerOrder: number[]; // Thứ tự các câu trả lời [4,2,1,3]
  }>;
  userAnswers: Array<{
    questionId: mongoose.Types.ObjectId;
    selectedAnswerId: mongoose.Types.ObjectId; // ID của câu trả lời được chọn
    isCorrect: boolean;
  }>; // Câu trả lời của user
  startedAt: Date; // Thời gian bắt đầu làm bài
  completedAt?: Date; // Thời gian hoàn thành (optional)
  lastSyncAt?: Date; // Thời gian sync answers cuối cùng (cho cross-device)
  createdAt: Date;
  updatedAt: Date;
}

// Schema cho PracticeExamHistory
const PracticeExamHistorySchema: Schema = new Schema(
  {
    courseId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    courseName: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    score: { type: Number, default: 0, min: 0, max: 100 }, // Điểm phần trăm
    totalQuestions: { type: Number, required: true, default: 100 },
    correctAnswers: { type: Number, default: 0, min: 0 },
    duration: { type: Number, default: 0 }, // Thời gian làm bài (giây)
    practiceType: {
      type: String,
      enum: ["course-review"],
      default: "course-review",
      required: true,
    },
    status: {
      type: String,
      enum: ["in_progress", "completed", "time_up", "abandoned"],
      default: "in_progress",
      required: true,
    },
    selectedQuestions: [
      {
        questionId: {
          type: Schema.Types.ObjectId,
          ref: "Question",
          required: true,
        },
        answerOrder: [{ type: Number }], // Lưu thứ tự các câu trả lời [4,2,1,3]
      },
    ],
    userAnswers: [
      {
        questionId: {
          type: Schema.Types.ObjectId,
          ref: "Question",
          required: true,
        },
        selectedAnswerId: { type: Schema.Types.ObjectId, required: true }, // Chỉ lưu ID của câu trả lời
        isCorrect: { type: Boolean, required: true },
      },
    ],
    startedAt: { type: Date, default: Date.now, required: true },
    completedAt: { type: Date }, // Optional - chỉ set khi hoàn thành
    lastSyncAt: { type: Date }, // Optional - thời gian sync answers cuối cùng
  },
  { timestamps: true }
);

// Tạo index cho tìm kiếm nhanh
PracticeExamHistorySchema.index({ userId: 1, status: 1, createdAt: -1 });
PracticeExamHistorySchema.index({ courseId: 1, userId: 1, status: 1 });
PracticeExamHistorySchema.index({ userId: 1, completedAt: -1 });
PracticeExamHistorySchema.index({ courseId: 1, completedAt: -1 });

// Model cho PracticeExamHistory
export default mongoose.model<IPracticeExamHistory>(
  "PracticeExamHistory",
  PracticeExamHistorySchema
);
