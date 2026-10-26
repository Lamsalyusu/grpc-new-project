import express from "express";
import cors from "cors";
import helmet from "helmet";
import router from "./routes/authRoutes";
import taskrouter from "./routes/taskRoutes";
import taskCollaboratorRouter from "./routes/taskCollaboratorRoutes";
import messageRoutes from "./routes/messageRoutes";
import errorHandler from "./middlewares/errormiddleware";
import notifroutes from "./routes/notificationRoutes";
import collaborationRoutes from "./routes/collaborationRoutes";
import adminRoutes from "./routes/adminRoutes";
import path from "path";
import logger from "./utils/logger";
import { apiLimiter } from "./middlewares/rateLimiter";

const app = express();

const allowedOrigins = [
  "http://127.0.0.1:5500",
  "http://localhost:5500",
  "http://127.0.0.1:3000",
  "http://localhost:3000",
];
const allowedOriginSet = new Set(allowedOrigins);
const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOriginSet.has(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Blocked by CORS policy"));
    }
  },
  credentials: true,
  methods: ["GET", "PUT", "POST", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Device-ID"],
  exposedHeaders: ["RateLimit-Limit", "RateLimit-Remaining", "RateLimit-Reset"],
};

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          "'unsafe-eval'",
          "https://cdn.socket.io",
        ],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        scriptSrcAttr: [
          "'unsafe-hashes'",
          "'sha256-B2kKObP1ttXxP4bc+z1ri7AcQKmY+Pws7G9VEvdlfHI='",
        ],
        imgSrc: [
          "'self'",
          "data:",
          "blob:",
          "https://rkqvvzwjesujnjleskda.supabase.co",
          "https://rkqvvzwjesujnjleskda.storage.supabase.co",
        ],
        connectSrc: [
          "'self'",
          "http://127.0.0.1:3000",
          "http://localhost:3000",
          "ws://127.0.0.1:3000",
          "wss://127.0.0.1:3000",
        ],
      },
    },
  }),
);

app.use((req, res, next) => {
  const startedAt = Date.now();

  res.on("finish", () => {
    logger.info({
      message: "HTTP request completed",
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      durationMs: Date.now() - startedAt,
      ip: req.ip,
    });
  });

  next();
});

app.use(cors(corsOptions));
app.use("/api/v1", apiLimiter);
app.use(express.json({ limit: "1mb" }));

// Serve static frontend files
app.use(express.static(path.join(__dirname, "../client")));

// Routes
app.use("/api/v1/auth", router);
app.use("/api/v1/tasks", taskCollaboratorRouter);
app.use("/api/v1/tasks", messageRoutes);
app.use("/api/v1/tasks", taskrouter);
app.use("/api/v1/notifications", notifroutes);
app.use("/api/v1/collaboration", collaborationRoutes);
app.use("/api/v1/admin", adminRoutes);
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok", message: "app running smoothly" });
});

app.use(errorHandler);
export default app;
