import crypto from "node:crypto";

export function getTransactionId() {
	return `tran_${crypto.randomUUID()}`;
}
