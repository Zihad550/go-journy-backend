import { Types } from "mongoose";

export const useObjectId = (id: string | Types.ObjectId) => {
  return new Types.ObjectId(id);
};
