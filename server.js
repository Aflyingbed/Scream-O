const uWS = require("uWebSockets.js");
const app = uWS.App();
const fs = require("node:fs");
const path = require("node:path");

const screams = [];
const MAX_SCREAMS = 20;

const MIME_TYPES = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
};

app.get("/*", (res, req) => {
  const filePath = req.getUrl() === "/" ? "/index.html" : req.getUrl();
  const fullPath = path.join(__dirname, "public", filePath);
  const ext = path.extname(filePath).toLowerCase();

  res.onAborted(() => {
    res.aborted = true;
  });

  fs.readFile(fullPath, (err, data) => {
    if (res.aborted) return;
    
    res.cork(() => {
      if (err) {
        res.writeStatus("404");
        res.writeHeader("Content-Type", "text/plain");
        res.end("404 Not Found");
        return;
      }
      const contentType = MIME_TYPES[ext];
      res.writeHeader("Content-Type", contentType);
      res.end(data);
    });
  });
});

app.ws("/screamo", {
  open: (ws) => {
    ws.subscribe("scream");
    ws.send(JSON.stringify({ type: "screamForClient", screams }));
  },
  message: (ws, message) => {
    const incomingScream = JSON.parse(Buffer.from(message).toString());

    if (incomingScream.type === "screams") {
      screams.push(incomingScream.scream);
      if (screams.length > MAX_SCREAMS) {
        screams.shift();
      }
      app.publish("scream", JSON.stringify({
        type: "screamForClient",
        screams,
      }));
    }
  },
});

app.listen(8000, (token) => {
  token ? console.log("Logged in") : console.log("Failed");
});
