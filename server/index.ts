import express from "express";

import { Server } from "socket.io";
import http from "node:http";
import cors from "cors";
import { createRoom, getRoom } from "./rooms/manager";

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

createRoom("1234", {
  name: "miguel",
  color: "red",
  id: "miguel1234",
  role: "agent",
});

io.on("connection", (socket) => {
  console.log("a user connected", socket.id);
  socket.on("sendMessage", (data) => {
    const state = getRoom("1234");
    console.log(state);
    state?.messages.push(data);
    console.log(state);
    io.emit("updateState", state);
  });
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
