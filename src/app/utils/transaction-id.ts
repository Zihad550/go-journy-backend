import crypto from "node:crypto";

export function get_transaction_id() {
	return `tran_${crypto.randomUUID()}`;
}
