const express = require("express");
const http = require("http");
const { WebSocketServer } = require("ws");
const path = require("path");

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: "/screamo" });

const screams = [];
const MAX_SCREAMS = 20;

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, "public")));

wss.on("connection", (ws) => {
  // Track message timestamps for rate limiting (max 15 messages per second per client)
  ws.messageTimestamps = [];

  // Send initial history to the new client
  ws.send(JSON.stringify({ type: "initialScreams", screams }));

  ws.on("message", (data) => {
    try {
      const now = Date.now();
      ws.messageTimestamps = ws.messageTimestamps.filter((t) => now - t < 1000);
      if (ws.messageTimestamps.length >= 15) {
        // Drop message if user is spamming above limits
        return;
      }
      ws.messageTimestamps.push(now);

      const incomingScream = JSON.parse(data.toString());

      if (incomingScream.type === "screams" && typeof incomingScream.scream === "string") {
        const trimmed = incomingScream.scream.trim();
        if (!trimmed || trimmed.length > 30) {
          return;
        }

        const newScream = trimmed;
        screams.push(newScream);
        if (screams.length > MAX_SCREAMS) {
          screams.shift();
        }

        const broadcastData = JSON.stringify({
          type: "newScream",
          scream: newScream,
        });

        wss.clients.forEach((client) => {
          if (client.readyState === 1) {
            client.send(broadcastData);
          }
        });
      }
    } catch (err) {
      console.error("Error parsing message:", err);
    }
  });
});

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
