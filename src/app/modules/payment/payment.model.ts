import { model, Schema } from "mongoose";
import { IPayment, PAYMENT_STATUS } from "./payment.interface";

export { PAYMENT_STATUS };

const paymentSchema = new Schema<IPayment>(
  {
    ride: {
      type: Schema.Types.ObjectId,
      ref: "Ride",
      unique: true,
    },
    driver: {
      type: Schema.Types.ObjectId,
      ref: "Driver",
    },
    transactionId: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: String,
      enum: Object.values(PAYMENT_STATUS),
      default: PAYMENT_STATUS.UNPAID,
    },
    amount: {
      type: Number,
      required: true,
    },
    paymentGatewayData: {
      type: Schema.Types.Mixed,
    },
    invoiceUrl: {
      type: String,
    },
    heldAt: {
      type: Date,
    },
    releasedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

export default model<IPayment>("Payment", paymentSchema);
