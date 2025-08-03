import { Types } from "mongoose";

export const useObjectId = (id: string) => {
  return new Types.ObjectId(id);
};
