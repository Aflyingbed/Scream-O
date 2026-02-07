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
  // Send existing screams to the new client
  ws.send(JSON.stringify({ type: "screamForClient", screams }));

  ws.on("message", (data) => {
    try {
      const incomingScream = JSON.parse(data.toString());

      if (incomingScream.type === "screams") {
        screams.push(incomingScream.scream);
        if (screams.length > MAX_SCREAMS) {
          screams.shift();
        }

        // Broadcast to all connected clients
        const broadcastData = JSON.stringify({
          type: "screamForClient",
          screams,
        });

        wss.clients.forEach((client) => {
          if (client.readyState === 1) { // 1 = OPEN
            client.send(broadcastData);
          }
        });
      }
    } catch (err) {
      console.error("Error parsing message:", err);
    }
  });
});

const PORT = 8000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
