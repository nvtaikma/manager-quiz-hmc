import { Schema, model } from "mongoose";

const answerSchema = new Schema({
  text: {
    type: String,
    required: true,
  },
  isCorrect: {
    type: Boolean,
    required: true,
  },
  order: {
    type: Number,
  },
});

const questionSchema = new Schema(
  {
    examId: {
      type: Schema.Types.ObjectId,
      ref: "Exam",
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    image: {
      type: String,
    },
    answers: [answerSchema],
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
    },
    orderNumber: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Question = model("Question", questionSchema);

export default Question;
