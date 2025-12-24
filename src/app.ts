import cookieParser from "cookie-parser";
import cors from "cors";
import express, { type Application } from "express";
import session from "express-session";
import passport from "passport";
import "./app/config/passport.config";
import globalErrorHandler from "./app/middlewares/global-error-handler";
import notFound from "./app/middlewares/not-found";
import { router } from "./app/routes";
import env from "./env";

const app: Application = express();

app.use(express.json());
app.set("trust proxy", 1);
app.use(express.urlencoded({ extended: true })); // for better form data handling
app.use(
	cors({
		credentials: true,
		origin: env.FRONTEND_URL,
	}),
);
app.use(cookieParser());

// Session middleware
app.use(
	session({
		secret: env.JWT_ACCESS_SECRET,
		resave: false,
		saveUninitialized: false,
		cookie: {
			secure: env.NODE_ENV === "production",
			httpOnly: true,
			maxAge: 24 * 60 * 60 * 1000, // 24 hours
		},
	}),
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// routes
app.use("/api/v1", router);

app.get("/", (_req, res) => {
	res.status(200).json({
		message: "Welcome to go journey backend",
	});
});

app.use(globalErrorHandler);

app.use(notFound);

export default app;
