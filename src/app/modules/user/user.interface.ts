import { Model, Types } from "mongoose";
import IDriver from "../driver/driver.interface";

export enum RoleEnum {
  ADMIN = "ADMIN",
  RIDER = "RIDER",
  DRIVER = "DRIVER",
}

export enum AccountStatusEnum {
  BLOCKED = "BLOCKED",
  ACTIVE = "ACTIVE",
}

export default interface IUser {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  role: RoleEnum;
  accountStatus: AccountStatusEnum;
  driver?: Types.ObjectId | IDriver;
  dailyCancelAttempt: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserModelType extends Model<IUser> {
  isPasswordMatched(
    plainTextPassword: string,
    hashedPassword: string,
  ): Promise<boolean>;
}
