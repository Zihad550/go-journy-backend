import { Request, Response } from 'express';
import { PaymentServices } from './payment.service';
import { SSLServices } from './sslCommerz.service';
import sendResponse from '../../utils/sendResponse';
import catchAsync from '../../utils/catchAsync';
import env from '../../../env';

const initPayment = catchAsync(async (req: Request, res: Response) => {
  const rideId = req.params.rideId;
  const result = await PaymentServices.initPayment(rideId);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Payment initiated successfully',
    data: result,
  });
});

const successPayment = catchAsync(async (req: Request, res: Response) => {
  const query = req.query;
  const result = await PaymentServices.successPayment(
    query as Record<string, string>,
  );

  if (result.success) {
    res.redirect(
      `${env.FRONTEND_URL}${env.SSL_CONFIG.SUCCESS_FRONTEND_PATH}?transactionId=${query.transactionId}&message=${result.message}&amount=${query.amount}&status=${query.status}`,
    );
  }
});

const failPayment = catchAsync(async (req: Request, res: Response) => {
  const query = req.query;
  const result = await PaymentServices.failPayment(
    query as Record<string, string>,
  );

  if (!result.success) {
    res.redirect(
      `${env.FRONTEND_URL}${env.SSL_CONFIG.FAIL_FRONTEND_PATH}?transactionId=${query.transactionId}&message=${result.message}&amount=${query.amount}&status=${query.status}`,
    );
  }
});

const cancelPayment = catchAsync(async (req: Request, res: Response) => {
  const query = req.query;
  const result = await PaymentServices.cancelPayment(
    query as Record<string, string>,
  );

  if (!result.success) {
    res.redirect(
      `${env.FRONTEND_URL}${env.SSL_CONFIG.CANCEL_FRONTEND_PATH}?transactionId=${query.transactionId}&message=${result.message}&amount=${query.amount}&status=${query.status}`,
    );
  }
});

const validatePayment = catchAsync(async (req: Request, res: Response) => {
  await SSLServices.validatePayment(req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Payment Validated Successfully',
    data: null,
  });
});

const getInvoiceDownloadUrl = catchAsync(
  async (req: Request, res: Response) => {
    const { paymentId } = req.params;
    const result = await PaymentServices.getInvoiceDownloadUrl(paymentId);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Invoice download URL retrieved successfully',
      data: result,
    });
  },
);

const holdPayment = catchAsync(async (req: Request, res: Response) => {
  const { paymentId } = req.params;
  const { rideId, driverId } = req.body;
  const result = await PaymentServices.holdPayment(paymentId, rideId, driverId);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Payment held successfully',
    data: result,
  });
});

const releasePayment = catchAsync(async (req: Request, res: Response) => {
  const { paymentId } = req.params;
  const { rideId } = req.body;
  const result = await PaymentServices.releasePayment(paymentId, rideId);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Payment released to driver successfully',
    data: result,
  });
});

export const PaymentController = {
  initPayment,
  successPayment,
  failPayment,
  cancelPayment,
  validatePayment,
  getInvoiceDownloadUrl,
  holdPayment,
  releasePayment,
};