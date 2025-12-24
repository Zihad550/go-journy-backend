import { Types } from "mongoose";

export function use_object_id(id: string | Types.ObjectId) {
	return new Types.ObjectId(id);
}
