import argon2 from "argon2";
import { model, Schema } from "mongoose";
import type IUser from "./user.interface";
import { IsActive, type IUserModelType, RoleEnum } from "./user.interface";

const userSchema = new Schema<IUser, IUserModelType>(
	{
		name: { type: String, required: true },
		email: { type: String, required: true, unique: true },
		phone: { type: String, unique: true, trim: true },
		password: { type: String },
		picture: { type: String },
		address: { type: String },
		isDeleted: { type: Boolean, default: false },
		isActive: {
			type: String,
			enum: Object.values(IsActive),
			default: IsActive.ACTIVE,
		},
		isVerified: { type: Boolean, default: false },
		role: {
			type: String,
			enum: Object.values(RoleEnum),
			default: RoleEnum.RIDER,
		},
		auths: [
			{
				provider: {
					type: String,
					enum: ["google", "credentials"],
					required: true,
				},
				providerId: { type: String, required: true },
			},
		],
		bookings: [{ type: Schema.Types.ObjectId, ref: "Booking" }],
		guides: [{ type: Schema.Types.ObjectId, ref: "Guide" }],
		driver: {
			type: Schema.Types.ObjectId,
			ref: "Driver",
		},
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

userSchema.post("save", (doc, next) => {
	if (doc.password) doc.password = "";
	next();
});

userSchema.statics.isPasswordMatched = async (
	plainTextPassword: string,
	hashedPassword: string | undefined,
) => {
	if (!hashedPassword) return false;
	return await argon2.verify(hashedPassword, plainTextPassword);
};

const User = model<IUser, IUserModelType>("User", userSchema);
export default User;
