import status from "http-status";
import { uploadBufferToCloudinary } from "../../config/cloudinary.config";
import AppError from "../../errors/AppError";
import { generatePdf, IInvoiceData } from "../../utils/invoice";
import { sendEmail } from "../../utils/sendEmail";
import { useObjectId } from "../../utils/useObjectId";
import { RideStatusEnum } from "../ride/ride.interface";
import Ride from "../ride/ride.model";
import Payment, { PAYMENT_STATUS } from "./payment.model";
import { ISSLCommerz } from "./sslCommerz.interface";
import { SSLServices } from "./sslCommerz.service";

const initPayment = async (rideId: string) => {
  const payment = await Payment.findOne({ ride: useObjectId(rideId) });
  if (!payment) {
    throw new AppError(status.NOT_FOUND, "Payment not found");
  }

  const ride = (await Ride.findById(payment.ride).populate(
    "rider",
    "name email phone address",
  )) as any;

  const sslPayload: ISSLCommerz = {
    address: ride.rider?.address || "",
    email: ride.rider?.email || "",
    phoneNumber: ride.rider?.phone || "",
    name: ride.rider?.name || "",
    amount: payment.amount,
    transactionId: payment.transactionId,
  };

  const sslPayment = await SSLServices.sslPaymentInit(sslPayload);
  return { paymentUrl: sslPayment.GatewayPageURL };
};

const successPayment = async (query: Record<string, string>) => {
  const session = await Ride.startSession();
  session.startTransaction();

  try {
    // Update payment status
    const updatedPayment = await Payment.findOneAndUpdate(
      { transactionId: query.transactionId },
      { status: PAYMENT_STATUS.PAID },
      { new: true, runValidators: true, session },
    );

    if (!updatedPayment) {
      throw new AppError(status.NOT_FOUND, "Payment not found");
    }

    // Update ride with payment held status
    await Ride.findByIdAndUpdate(
      updatedPayment.ride,
      { paymentHeld: true },
      { runValidators: true, session },
    );

    // Get ride data (without updating status)
    const ride = (await Ride.findById(updatedPayment.ride)
      .populate("rider", "name email")
      .populate("driver", "name")) as any;

    // Generate invoice
    const invoiceData: IInvoiceData = {
      bookingDate: ride?.createdAt || new Date(),
      price: updatedPayment.amount,
      rideTitle: `Ride from ${ride?.pickupLocation?.lat || 0},${ride?.pickupLocation?.lng || 0} to ${ride?.destination?.lat || 0},${ride?.destination?.lng || 0}`,
      transactionId: updatedPayment.transactionId,
      userName: ride?.rider?.name || "",
      downloadLink: "",
    };

    const pdfBuffer = await generatePdf(invoiceData);
    const cloudinaryResult = await uploadBufferToCloudinary(
      pdfBuffer,
      "invoice",
    );

    await Payment.findByIdAndUpdate(
      updatedPayment._id,
      { invoiceUrl: cloudinaryResult.secure_url },
      { runValidators: true, session },
    );

    invoiceData.downloadLink = cloudinaryResult.secure_url;

    // Send email with invoice
    await sendEmail({
      to: ride?.rider?.email || "",
      subject: "Your Ride Invoice",
      templateName: "invoice",
      templateData: invoiceData,
      attachments: [
        {
          filename: "invoice.pdf",
          content: pdfBuffer,
          contentType: "application/pdf",
        },
      ],
    });

    await session.commitTransaction();
    return { success: true, message: "Payment Completed Successfully" };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  }
};

const failPayment = async (query: Record<string, string>) => {
  const session = await Ride.startSession();
  session.startTransaction();

  try {
    const updatedPayment = await Payment.findOneAndUpdate(
      { transactionId: query.transactionId },
      { status: PAYMENT_STATUS.FAILED },
      { new: true, runValidators: true, session },
    );

    await Ride.findByIdAndUpdate(
      updatedPayment!.ride,
      { status: "cancelled" },
      { runValidators: true, session },
    );

    await session.commitTransaction();
    return { success: false, message: "Payment Failed" };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  }
};

const cancelPayment = async (query: Record<string, string>) => {
  const session = await Ride.startSession();
  session.startTransaction();

  try {
    const updatedPayment = await Payment.findOneAndUpdate(
      { transactionId: query.transactionId },
      { status: PAYMENT_STATUS.CANCELLED },
      { new: true, runValidators: true, session },
    );

    await Ride.findByIdAndUpdate(
      updatedPayment!.ride,
      { status: "cancelled" },
      { runValidators: true, session },
    );

    await session.commitTransaction();
    return { success: false, message: "Payment Cancelled" };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  }
};

const getInvoiceDownloadUrl = async (paymentId: string) => {
  const payment = await Payment.findById(useObjectId(paymentId)).select("invoiceUrl");
  if (!payment?.invoiceUrl) {
    throw new AppError(404, "Invoice not found");
  }
  return payment.invoiceUrl;
};

const holdPayment = async (
  paymentId: string,
  rideId: string,
  driverId: string,
) => {
  const session = await Payment.startSession();
  session.startTransaction();

  try {
    // Find and validate payment
    const payment = await Payment.findById(useObjectId(paymentId)).session(session);
    if (!payment) {
      throw new AppError(status.NOT_FOUND, "Payment not found");
    }

    if (payment.status !== PAYMENT_STATUS.PAID) {
      throw new AppError(
        status.BAD_REQUEST,
        "Payment must be paid before it can be held",
      );
    }

    // Update payment status to held
    const updatedPayment = await Payment.findByIdAndUpdate(
      useObjectId(paymentId),
      {
        status: PAYMENT_STATUS.HELD,
        driver: useObjectId(driverId),
        heldAt: new Date(),
      },
      { new: true, runValidators: true, session },
    );

    // Update ride with payment held flag
    await Ride.findByIdAndUpdate(
      useObjectId(rideId),
      { paymentHeld: true },
      { runValidators: true, session },
    );

    await session.commitTransaction();
    return {
      paymentId: updatedPayment?._id,
      status: updatedPayment?.status,
      heldAt: updatedPayment?.heldAt,
    };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  }
};

const releasePayment = async (paymentId: string, rideId: string) => {
  const session = await Payment.startSession();
  session.startTransaction();

  try {
    // Find and validate payment
    const payment = await Payment.findById(useObjectId(paymentId)).session(session);
    if (!payment) {
      throw new AppError(status.NOT_FOUND, "Payment not found");
    }

    if (payment.status !== PAYMENT_STATUS.HELD) {
      throw new AppError(
        status.BAD_REQUEST,
        "Payment must be held before it can be released",
      );
    }

    // Verify ride is completed
    const ride = await Ride.findById(useObjectId(rideId)).session(session);
    if (!ride || ride.status !== RideStatusEnum.Completed) {
      throw new AppError(
        status.BAD_REQUEST,
        "Ride must be completed before payment can be released",
      );
    }

    // Update payment status to released
    const updatedPayment = await Payment.findByIdAndUpdate(
      useObjectId(paymentId),
      {
        status: PAYMENT_STATUS.RELEASED,
        releasedAt: new Date(),
      },
      { new: true, runValidators: true, session },
    );

    // Update ride with payment released flag
    await Ride.findByIdAndUpdate(
      useObjectId(rideId),
      { paymentReleased: true, paymentHeld: false },
      { runValidators: true, session },
    );

    // TODO: Implement actual fund transfer to driver's account/wallet
    // This would involve calling the payment gateway's release API

    await session.commitTransaction();
    return {
      paymentId: updatedPayment?._id,
      status: updatedPayment?.status,
      releasedAt: updatedPayment?.releasedAt,
      driverId: updatedPayment?.driver,
      amount: updatedPayment?.amount,
    };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  }
};

export const PaymentServices = {
  initPayment,
  successPayment,
  failPayment,
  cancelPayment,
  getInvoiceDownloadUrl,
  holdPayment,
  releasePayment,
};
