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
    origin: "http://localhost:3000", // Cambiar por url del cliente
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("a user connected", socket.id);

  socket.on("send_message", (data) => {
    socket.broadcast.emit("receive_message", data);
  });
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
