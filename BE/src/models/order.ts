import { Schema, model } from "mongoose";

const orderItemSchema = new Schema({
  productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  type: {
    type: String,
    required: true,
    enum: ["1", "2", "3"],
    default: "1",
  },
  amount: {
    type: Number,
    required: true,
    default: function (this: any) {
      return this.type === "1" || this.type === "3" ? 30000 : 15000;
    },
  },
});

const orderSchema = new Schema(
  {
    customerId: {
      type: Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    items: [orderItemSchema],
    totalAmount: {
      type: Number,
      required: true,
      default: function (this: any) {
        return this.items.reduce(
          (acc: number, item: any) => acc + item.amount,
          0
        );
      },
    },
    orderDate: { type: Date, required: true },
    status: {
      type: String,
      required: true,
      enum: ["pending", "completed", "cancelled"],
    },
  },
  {
    timestamps: true,
  }
);

const Order = model("Order", orderSchema);

export default Order;
