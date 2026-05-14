import { Schema, model, Document, Types } from "mongoose";

export interface IQuestionReport extends Document {
  userId: Types.ObjectId;
  questionId: Types.ObjectId;
  examId?: Types.ObjectId;
  productId: Types.ObjectId;
  reportType: "content_error" | "wrong_answer";
  description?: string;
  correctAnswer?: string;
  reason?: string;
  imageUrl?: string;
  contactMethod: "zalo" | "facebook";
  contactValue: string;
  status: "pending" | "reviewed" | "resolved" | "rejected";
  questionText?: string;
  adminNote?: string;
  resolvedBy?: Types.ObjectId;
  resolvedAt?: Date;
  createdAt: Date;
}

const questionReportSchema = new Schema<IQuestionReport>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    questionId: {
      type: Schema.Types.ObjectId,
      ref: "Question",
      required: true,
    },
    examId: {
      type: Schema.Types.ObjectId,
      ref: "Exam",
    },
    productId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    reportType: {
      type: String,
      enum: ["content_error", "wrong_answer"],
      required: true,
    },
    description: {
      type: String,
    },
    correctAnswer: {
      type: String,
    },
    reason: {
      type: String,
    },
    imageUrl: {
      type: String,
    },
    contactMethod: {
      type: String,
      enum: ["zalo", "facebook"],
      required: true,
    },
    contactValue: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "reviewed", "resolved", "rejected"],
      default: "pending",
    },
    questionText: {
      type: String,
    },
    adminNote: {
      type: String,
      maxlength: 1000,
    },
    resolvedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    resolvedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

questionReportSchema.index({ questionId: 1, status: 1 });
questionReportSchema.index({ questionId: 1, userId: 1, status: 1 });
questionReportSchema.index({ createdAt: -1 });
questionReportSchema.index({ status: 1, createdAt: -1 });
questionReportSchema.index({ reportType: 1, status: 1 });

const QuestionReport = model<IQuestionReport>(
  "QuestionReport",
  questionReportSchema
);

export default QuestionReport;
