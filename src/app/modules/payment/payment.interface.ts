import { Types } from 'mongoose';

export enum PAYMENT_STATUS {
  PAID = 'PAID',
  UNPAID = 'UNPAID',
  CANCELLED = 'CANCELLED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
  HELD = 'HELD',
  RELEASED = 'RELEASED',
}

export interface IPayment {
  ride: Types.ObjectId;
  driver?: Types.ObjectId;
  transactionId: string;
  amount: number;
  paymentGatewayData?: any;
  invoiceUrl?: string;
  status: PAYMENT_STATUS;
  heldAt?: Date;
  releasedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISSLCommerz {
  amount: number;
  transactionId: string;
  name: string;
  email: string;
  phoneNumber: string;
  address: string;
}