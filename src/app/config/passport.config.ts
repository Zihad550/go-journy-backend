import passport from "passport";
import {
	Strategy as GoogleStrategy,
	type Profile,
	type VerifyCallback,
} from "passport-google-oauth20";
import { Strategy as LocalStrategy } from "passport-local";
import env from "../../env";
import { IsActive, RoleEnum } from "../modules/user/user.interface";
import User from "../modules/user/user.model";

// Local Strategy
passport.use(
	new LocalStrategy(
		{
			usernameField: "email",
			passwordField: "password",
		},
		async (email, password, done) => {
			try {
				const user = await User.findOne({ email });

				if (!user) return done(null, false, { message: "User does not exist" });
				if (!user.isVerified)
					return done(null, false, { message: "User is not verified" });
				if (user.isActive !== IsActive.ACTIVE)
					return done(null, false, {
						message: `User is ${user.isActive}`,
					});
				if (user.isDeleted)
					return done(null, false, { message: "User is deleted" });

				const isPasswordMatched = await User.isPasswordMatched(
					password,
					user.password || "",
				);
				if (!isPasswordMatched)
					return done(null, false, { message: "Password does not match" });

				return done(null, user);
			} catch (error) {
				done(error);
			}
		},
	),
);

// Google OAuth Strategy
passport.use(
	new GoogleStrategy(
		{
			clientID: env.GOOGLE_CLIENT_ID,
			clientSecret: env.GOOGLE_CLIENT_SECRET,
			callbackURL: env.GOOGLE_CALLBACK_URL,
		},
		async (
			_accessToken: string,
			_refreshToken: string,
			profile: Profile,
			done: VerifyCallback,
		) => {
			try {
				const email = profile.emails?.[0].value;

				if (!email) {
					return done(null, false, { mesaage: "No email found" });
				}

				let user = await User.findOne({ email });

				if (user && user.isVerified === false) {
					return done(null, false, { message: "User is not verified" });
				}

				if (user && user.isActive === IsActive.BLOCKED) {
					return done(null, false, {
						message: `User is blocked`,
					});
				}

				if (user?.isDeleted) {
					return done(null, false, { message: "User is deleted" });
				}

				if (!user) {
					user = await User.create({
						email,
						name: profile.displayName,
						picture: profile.photos?.[0].value,
						role: RoleEnum.RIDER,
						isVerified: true,
						auths: [
							{
								provider: "google",
								providerId: profile.id,
							},
						],
					});
				}

				return done(null, user);
			} catch (error) {
				return done(error);
			}
		},
	),
);

// Serialize user for session
passport.serializeUser((user: any, done) => {
	done(null, user._id);
});

// Deserialize user from session
passport.deserializeUser(async (id: string, done) => {
	try {
		const user = await User.findById(id);
		done(null, user);
	} catch (error) {
		done(error);
	}
});

export default passport;
