import express, { Express, Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import authRouter from "./routes/auth.js";
import walletRouter from "./routes/wallet.js";
import transactionRouter from "./routes/transactions.js";
import cryptoRouter from "./routes/crypto.js";
import notificationRouter from "./routes/notifications.js";
import ordersRouter from "./routes/orders.js";
import alertsRouter from "./routes/alerts.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { fetchPrices, getCachedPrices } from "./services/priceService.js";

dotenv.config();

// Validate required environment variables on startup
const REQUIRED_ENV = [
  "SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "SUPABASE_ANON_KEY",
] as const;
for (const key of REQUIRED_ENV) {
  if (!process.env[key]) {
    console.error(`❌ Missing required environment variable: ${key}`);
    console.error(
      "   Copy backend/.env.example → backend/.env and fill in your Supabase keys.",
    );
    process.exit(1);
  }
}

const app: Express = express();
// Trust proxy headers (X-Forwarded-For) — needed for accurate IP-based rate limiting
app.set("trust proxy", 1);
const httpServer = createServer(app);

// CORS: use explicit allowlist in production, open in dev
// React Native doesn't enforce CORS, but web and browser clients do.
const corsOrigin: string | string[] | boolean = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map((o) => o.trim())
  : process.env.NODE_ENV === "production"
    ? true // allow all origins if CORS_ORIGIN not set — set it in Render for stricter control
    : ["http://localhost:8081", "http://localhost:19006"];

if (process.env.NODE_ENV === "production" && !process.env.CORS_ORIGIN) {
  console.warn(
    "⚠️  CORS_ORIGIN is not set — all origins are allowed. Set it in Render for stricter control.",
  );
}

const io = new SocketIOServer(httpServer, {
  cors: {
    origin: corsOrigin,
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
  path: "/socket.io/",
});

const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: corsOrigin,
    credentials: true,
  }),
);

// Health check
app.get("/health", (req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// API Routes
app.use("/api/auth", authRouter);
app.use("/api/wallet", walletRouter);
app.use("/api/transactions", transactionRouter);
app.use("/api/crypto", cryptoRouter);
app.use("/api/notifications", notificationRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/alerts", alertsRouter);

// WebSocket events
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("subscribe_prices", (data: any) => {
    const symbols = Array.isArray(data) ? data : (data?.symbols ?? []);
    const roomName = `prices:${symbols.join(",")}`;
    socket.join(roomName);
    socket.emit("subscribed", {
      message: "Subscribed to price updates",
      symbols,
    });

    // Immediately push cached prices to this client so they don't wait for next interval
    const cached = getCachedPrices();
    if (cached.length > 0) {
      socket.emit("price_update", { prices: cached });
    } else {
      // No cache yet — trigger a fresh fetch and send to this client
      fetchPrices()
        .then((prices) => socket.emit("price_update", { prices }))
        .catch(() => {});
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Store io instance for route access
app.set("io", io);

// ─── WebSocket Price Broadcasting ────────────────────────────────────────────
const BROADCAST_INTERVAL_MS = 30_000; // broadcast every 30 seconds

async function broadcastPrices() {
  try {
    const prices = await fetchPrices();
    io.emit("price_update", { prices });
    console.log(
      `📊 Broadcasted ${prices.length} prices to ${io.engine.clientsCount} client(s)`,
    );
  } catch (err: any) {
    console.error("Price broadcast failed:", err.message);
  }
}

// Initial broadcast on startup (after a short delay so the server is ready)
setTimeout(broadcastPrices, 2_000);

// Then repeat on the interval
setInterval(broadcastPrices, BROADCAST_INTERVAL_MS);

// Error handling
app.use(errorHandler);

httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 WebSocket available at ws://localhost:${PORT}`);
  console.log(`🌍 CORS enabled for: ${process.env.CORS_ORIGIN || "*"}`);
});

export default app;
