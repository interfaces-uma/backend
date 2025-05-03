import { roomManager } from "./roomManager";
import type { Card, Role, TeamColor, User, Clue } from "./types";
import { io, server, port } from "./index";
import { gameManager } from "./gameManager";
import { logger } from "./utils";

const game = gameManager();
const rooms = roomManager();

io.on("connection", (socket) => {
  logger.debug(`El usuario ${socket.id} se ha conectado`, "Socket");
  socket.on("sendMessage", (data, roomCode) => {
    const state = rooms.getRoom(roomCode);
    if (!state) return;
    state?.messages.push(data);
    logger.debug(`El usuario ${data.user} ha enviado un mensaje`, "Socket");
    io.to(roomCode).emit("updateState", state);
  });

  socket.on("createRoom", (user, callback) => {
    const code = Math.floor(Math.random() * 9000) + 1000;
    let state = rooms.getRoom(code.toString()); //la sala
    if (state) {
      //si la sala ya existe, no se puede crear
      callback({
        success: false,
        message: "Ha ocurrido un error, vuelva a intentarlo",
      });
    } else {
      //si no existe, la creamos
      state = rooms.createRoom(code.toString(), user); //creamos la sala
      socket.join(code.toString()); //para que el socket este asociado a la sala y cuando se emita un evento, solo se emita a los que esten en esa sala
      socket.data.roomCode = code.toString(); //guardamos el codigo de la sala en el socket
      socket.data.name = user.name; //guardamos el nombre del usuario en el socket
      io.to(code.toString()).emit("updateState", state); //io es todo, code la sala que quiero y emit de la funcion updateState con el estado de la sala
      callback({ success: true });
    }
  });

  socket.on("joinRoom", (user, roomCode, callback) => {
    const state = rooms.getRoom(roomCode);
    if (!state) {
      callback({
        success: false,
        message: "El codigo de sala no existe",
      });
    } else {
      rooms.joinRoom(roomCode, user);
      socket.join(roomCode);
      socket.data.roomCode = roomCode;
      socket.data.name = user.name;
      io.to(roomCode).emit("updateState", state);
      callback({ success: true });
    }
  });

  socket.on("leaveRoom", (user, roomCode) => {
    const state = rooms.getRoom(roomCode);
    if (state) {
      rooms.leaveRoom(roomCode, user);
      socket.leave(roomCode);
      socket.data.roomCode = null;
      io.to(roomCode).emit("updateState", state);
    }
  });

  socket.on(
    "joinTeam",
    (
      { user, color, role }: { user: User; color: TeamColor; role: Role },
      roomCode,
    ) => {
      const state = rooms.getRoom(roomCode);
      if (!state) return;
      if (user.color === color) return; // Si el usuario ya pertenece al equipo, no hace nada

      user.color = color;
      user.role = role;
      const team = state.teams[color];

      for (const teamColor of ["red", "blue"]) {
        const t = state.teams[teamColor as "red" | "blue"];
        if (t.leader?.id === user.id) {
          t.leader = null;
        }
        t.agents = t.agents.filter((agent) => agent.id !== user.id);
      }

      state.players = state.players.filter((player) => player.id !== user.id);

      if (role === "leader") {
        team.leader = user;
      } else {
        team.agents.push(user);
      }

      state.messages.push({
        team: "",
        user: "",
        message: `El jugador ${user.name} se unió al equipo ${color}`,
        isLog: true,
      });

      io.to(roomCode).emit("updateState", state);
    },
  );

  socket.on("leaveTeam", (code, user) => {
    const state = rooms.getRoom(code);
    if (!state) return;
    game.leaveTeam(state, user);

    io.to(code).emit("updateState", state);
  });

  socket.on("startGame", (roomCode, callback) => {
    const state = rooms.getRoom(roomCode);
    if (!state) return;

    if (state.players.length > 0) {
      callback({
        success: false,
        message: "Todos los jugadores deben unirse a un equipo",
      });
      return;
    }

    /*
    if (state.teams.red.leader === null || state.teams.blue.leader === null) {
      callback({
        success: false,
        message: "Ambos equipos deben tener un capitan",
      });
      return;
    }

    if (
      state.teams.red.agents.length < 1 ||
      state.teams.blue.agents.length < 1
    ) {
      callback({
        success: false,
        message: "Ambos equipos deben tener al menos un agente",
      });
      return;
    }
      */

    game.startGame(state); // Genera el tablero y establece el turno inicial

    io.to(roomCode).emit("updateState", state);
    io.to(roomCode).emit("redirectGame");
  });

  socket.on("sendClue", (clue: Clue) => {
    const roomCode = socket.data.roomCode;
    const state = rooms.getRoom(roomCode);
    if (!state) return;

    game.setClue(state, clue); // Establece la pista y el conteo de palabras

    game.changeTurn(state); // Cambia el turno al siguiente jugador

    io.to(roomCode).emit("updateState", state);
  });

  socket.on("nextTurn", () => {
    const roomCode = socket.data.roomCode;
    const state = rooms.getRoom(roomCode);
    if (!state) return;

    game.changeTurn(state); // Cambia el turno al siguiente jugador

    io.to(roomCode).emit("updateState", state);
  });

  socket.on("guessCard", (card: Card) => {
    const roomCode = socket.data.roomCode;
    const state = rooms.getRoom(roomCode);
    if (!state) return;

    game.revealCard(state, card); // Revela la carta seleccionada

    state.messages.push({
      team: "",
      user: "",
      message: `El jugador ${socket.data.name} ha revelado la carta ${card.word}`,
      isLog: true,
    });

    io.to(roomCode).emit("updateState", state);
  });
});

server.listen(port, () => {
  logger.info(`Server is running on port ${port}`, "Socket");
});
