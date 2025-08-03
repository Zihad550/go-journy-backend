import cookieParser from "cookie-parser";
import cors from "cors";
import express, { type Application } from "express";
import globalErrorHandler from "./app/middlewares/globalErrorHandler";
import notFound from "./app/middlewares/notFound";
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

// routes
app.use("/api/v1", router);

app.get("/", (req, res) => {
  res.status(200).json({
    message: "Welcome to go journey backend",
  });
});

app.use(globalErrorHandler);

app.use(notFound);

export default app;
