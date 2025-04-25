import express from "express";

import { exec } from "node:child_process";
import http from "node:http";
import { join } from "node:path";
import cors from "cors";
import { Server } from "socket.io";
import { createRoom, getRoom, joinRoom, leaveRoom } from "./roomManager";
import type { Role, TeamColor, User } from "./types";

const port = 3001;

const app = express();
app.use(cors());

const server = http.createServer(app);

export const io = new Server(server, {
  cors: {
    origin: "*", // Cambiar por url del cliente
    methods: ["GET", "POST"],
  },
});

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
    },
  );
  res.status(200).send("hook recieved");
});

app.get("/", (req, res) => {
  res.send("Este es el backend de codigo secreto!!!");
});
app.get("/users", (req, res) => {
  res.send("Usuarios");
});

app.get("/room/:id", (req, res) => {
  res.send(getRoom(req.params.id));
});



createRoom("1234", {
  name: "miguel",
  color: "red",
  id: "miguel1234",
  role: "agent",
});


server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
