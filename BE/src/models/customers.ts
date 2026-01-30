import { Schema, model } from "mongoose";

const customerSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    count: { type: Number, default: 0 },
    avatar: {
      type: String,
      default: function (this: any) {
        return `https://ui-avatars.com/api/?name=${this.email}&background=random`;
      },
    },
  },
  { timestamps: true }
);

const Customer = model("Customer", customerSchema);

export default Customer;
