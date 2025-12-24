import { Types } from "mongoose";

export function useObjectId(id: string | Types.ObjectId) {
	return new Types.ObjectId(id);
}
