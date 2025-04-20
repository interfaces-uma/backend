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
    origin: "*", // Cambiar por url del cliente
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

  socket.on("createRoom", (user, callback) => {
    const code = Math.floor(Math.random() * 9000) + 1000;
    let state = getRoom(code.toString());
    if (state) {
      callback({
        success: false,
        message: "Ha ocurrido un error, vuelva a intentarlo",
      });
    } else {
      state = createRoom(code.toString(), user);
      socket.join(code.toString());
      io.to(code.toString()).emit("updateState", state);
      callback({ success: true });
    }
  });
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
