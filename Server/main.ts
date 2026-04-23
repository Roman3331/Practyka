import { Hono } from "hono";
import { cors } from "hono/cors";
import { serveStatic } from "hono/bun";
import { createBunWebSocket } from "hono/bun";
import { connectToDatabase } from "./src/utils/db";
import authRoutes from "./src/routes/routes";
import { wsManager } from "./src/utils/ws";

const app = new Hono();
const { upgradeWebSocket, websocket } = createBunWebSocket();

// WebSocket Route - Place BEFORE global middleware to ensure no interference
app.all(
  "/ws",
  upgradeWebSocket((c) => {
    const userId = c.req.query("userId");
    return {
      onOpen(evt, ws) {
        console.log(`WS Connection opened for user: ${userId || 'anonymous'}`);
        ws.send(JSON.stringify({ type: 'connected', message: 'Welcome to WebSocket' }));
        wsManager.addClient(ws as any, userId || null);
      },
      onClose(evt, ws) {
        console.log("WS Connection closed", evt.reason);
        wsManager.removeClient(ws as any);
      },
      onMessage(evt, ws) {
        try {
          const data = JSON.parse(evt.data as string);
          if (data.type === 'identify' && data.userId) {
             wsManager.setUserId(ws as any, data.userId);
          }
        } catch (e) {}
      },
    };
  })
);

// Middleware
app.use("*", cors());
app.use("/uploads/*", serveStatic({ root: "./public" }));

// Routes
app.route("/api/auth", authRoutes);

// Root route
app.get("/", (c) => c.text("Server is running with WebSockets! v2"));

// Start server
const startServer = async () => {
  try {
    await connectToDatabase();
    
    const port = Number(process.env.PORT) || 3100;
    console.log(`Server is starting on port ${port}`);
    
    return {
      port,
      fetch: app.fetch,
      websocket,
    };
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

export default await startServer();