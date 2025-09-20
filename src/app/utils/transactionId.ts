import crypto from 'crypto';

export const getTransactionId = () => {
  return `tran_${crypto.randomUUID()}`;
};