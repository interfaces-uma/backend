import express from "express";

import { Server } from "socket.io";
import http from "node:http";
import cors from "cors";

const port = 3001;

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("a user connected", socket.id);
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
