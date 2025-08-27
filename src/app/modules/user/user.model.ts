import argon2 from "argon2";
import { model, Schema } from "mongoose";
import IUser, {
  AccountStatusEnum,
  IUserModelType,
  RoleEnum,
} from "./user.interface";

const userSchema = new Schema<IUser, IUserModelType>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true, unique: true, trim: true },
    password: { type: String },
    role: {
      type: String,
      enum: Object.values(RoleEnum),
      default: RoleEnum.RIDER,
    },
    accountStatus: {
      type: String,
      enum: Object.values(AccountStatusEnum),
      default: AccountStatusEnum.ACTIVE,
    },
    driver: {
      type: Schema.Types.ObjectId,
      ref: "Driver",
    },
    // dailyCancelAttempt: {
    //   type: Number,
    //   default: 3,
    // },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

userSchema.pre("save", async function (next) {
  if (this.password) this.password = await argon2.hash(this.password);
  next();
});

userSchema.pre("findOneAndUpdate", async function (next) {
  const updateData = this.getUpdate() as Partial<IUser>;

  if (updateData?.password) {
    const hash = await argon2.hash(updateData.password);
    updateData.password = hash;
  }
  this.setUpdate(updateData);
  next();
});

userSchema.post("save", function (doc, next) {
  doc.password = "";
  next();
});

userSchema.statics.isPasswordMatched = async function (
  plainTextPassword: string,
  hashedPassword: string,
) {
  return await argon2.verify(hashedPassword, plainTextPassword);
};

const User = model<IUser, IUserModelType>("User", userSchema);
export default User;
