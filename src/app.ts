import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Application, Request, Response } from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import httpStatus from "http-status";
import morgan from "morgan";
import config from "./config";
import { globalErrorHandler } from "./middlewares/globalErrorHandler";
import { notFound } from "./middlewares/notFound";
import { AuthRoutes } from "./modules/auth/auth.route";
import { UserRoutes } from "./modules/user/user.route";

const app: Application = express();

// Secure Express apps by setting various HTTP headers
app.use(helmet());

// HTTP request logger middleware
app.use(morgan("dev"));

app.use(
  cors({
    origin: config.app_url,
    credentials: true,
  }),
);

// Raw parser for Stripe Webhooks (must run before express.json())
app.use("/api/payment/webhook", express.raw({ type: "application/json" }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Rate limiting middleware for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    status_code: 429,
    message:
      "Too many authentication attempts from this IP, please try again after 15 minutes",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.get("/", (req: Request, res: Response) => {
  res.json({
    success: true,
    status_code: httpStatus.OK,
    message: "Server is running successfully",
  });
});

app.use("/api", UserRoutes);
app.use("/api", authLimiter, AuthRoutes);

app.use(notFound);

app.use(globalErrorHandler);

export default app;
