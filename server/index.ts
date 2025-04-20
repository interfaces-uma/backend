import express from "express";

import { Server } from "socket.io";
import http from "node:http";
import cors from "cors";
import { exec } from "child_process";
import { createRoom, getRoom, joinRoom, leaveRoom } from "./rooms/manager";
import { join } from "node:path";

const port = 3001;

const app = express();
app.use(cors());

const server = http.createServer(app);

app.post("/webhook", (req, res) => {
  exec(
    "git pull origin main && pm2 restart codigo",
    (error, stdout, stderr) => {
      if (error) {
        console.log("Error al desplegar", error);
      }
      if (stderr) {
        console.error("stderr: ", stderr);
      }
      console.log("stdout: ", stdout);
      res.status(200).send("hook recieved");
    }
  );
});

app.get("/", (req, res) => {
  res.send("Este es el backend de codigo secreto!!!");
});

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
  socket.on("sendMessage", (data, roomCode) => {
    const state = getRoom(roomCode);
    console.log(state);
    state?.messages.push(data);
    console.log(state);
    io.to(roomCode).emit("updateState", state);
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

  socket.on("joinRoom", (user, roomCode, callback) => {
    const state = getRoom(roomCode);
    if (!state) {
      callback({
        success: false,
        message: "El codigo de sala no existe",
      });
    } else {
      joinRoom(roomCode, user);
      socket.join(roomCode);
      io.to(roomCode).emit("updateState", state);
      callback({ success: true });
    }
  });

  socket.on("leaveRoom", (user, roomCode) => {
    const state = getRoom(roomCode);
    if (state) {
      leaveRoom(roomCode, user);
      socket.leave(roomCode);

      io.to(roomCode).emit("updateState", state);
    }
  });

  socket.on("joinTeam", ({ user, color, role }, roomCode) => {
    const state = getRoom(roomCode);
    if (!state) return;

    const team = state.teams[color as "red" | "blue"];

    for (const teamColor of ["red", "blue"]) {
      const t = state.teams[teamColor as "red" | "blue"];
      if (t.leader?.id === user.id) {
        t.leader = null;
      }
      t.agents = t.agents.filter((agent) => agent.id !== user.id);
    }

    if (role === "leader") {
      team.leader = user;
    } else {
      team.agents.push(user);
    }

    io.to(roomCode).emit("updateState", state);
  });
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
