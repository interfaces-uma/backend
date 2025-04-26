import express from "express";

import { exec } from "node:child_process";
import http, { get } from "node:http";
import cors from "cors";
import { Server } from "socket.io";
import { roomManager } from "./roomManager";
import type { ClientToServerEvents, ServerToClientEvents } from "./types";
import { logger } from "./utils";

export const port = 3001;
const rooms = roomManager();
const app = express();
app.use(cors());

export const server = http.createServer(app);

/** Variable que expone el modulo de socket.io
 * Esta variable expone el modulo de socket.io para poder usarlo en otros modulos.
 * Permite la comunicacion entre el servidor y el cliente.
 */
export const io = new Server<ClientToServerEvents, ServerToClientEvents>(
  server,
  {
    cors: {
      origin: "*", // Cambiar por url del cliente
      methods: ["GET", "POST"],
    },
  },
);

app.get("/", (req, res) => {
  res.send("Este es el backend de codigo secreto!!!");
});
app.get("/users", (req, res) => {
  res.send("Usuarios");
});

app.get("/room/:id", (req, res) => {
  res.send(rooms.getRoom(req.params.id));
});

app.post("/webhook", (req, res) => {
  exec(
    "git pull origin main && pm2 restart codigo",
    (error, stdout, stderr) => {
      if (error) {
        logger.error("Errror al desplegar", "Webhook");
      }
      if (stderr) {
        logger.error(`Error: ${stderr}`, "Webhook");
      }
      logger.debug(stdout, "Webhook");
    },
  );
  res.status(200).send("hook recieved");
});

rooms.createRoom("1234", {
  name: "miguel",
  color: "red",
  id: "miguel1234",
  role: "agent",
});
