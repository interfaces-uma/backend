import type { GameState, User } from "./types";

const rooms = new Map<string, GameState>();

export const createRoom = (code: string, user: User): GameState => {
  const initialState: GameState = {
    mode: "online",
    code,
    user: user,
    players: [user],
    teams: {
      blue: {
        leader: null,
        agents: [],
      },
      red: {
        leader: null,
        agents: [],
      },
    },
    cards: [],
    turn: {
      team: "red",
      role: "leader",
    },
    clue: null,
    messages: [],
  };
  rooms.set(code, initialState);
  console.log(Array.from(rooms.entries()));
  console.log(`El usuario ${user.name} creó a la sala ${code}`);

  return initialState;
};

export const joinRoom = (code: string, user: User): GameState | null => {
  const room = rooms.get(code);
  if (!room) return null;
  if (!room.players.find((p) => p.id === user.id)) {
    room.players.push(user);
  }

  console.log(`El usuario ${user.name} se unió a la sala ${code}`);
  return room;
};

export const leaveRoom = (code: string, user: User): GameState | null => {
  const room = rooms.get(code);
  if (!room) return null;
  room.players = room.players.filter((p) => p.id !== user.id);

  for (const teamColor of ["red", "blue"]) {
    const t = room.teams[teamColor as "red" | "blue"];
    if (t.leader?.id === user.id) {
      t.leader = null;
    }
    t.agents = t.agents.filter((agent) => agent.id !== user.id);
  }
  console.log(`El usuario ${user.name} salió de la sala ${code}`);

  if (room.players.length === 0) {
    //Si somos el ultimo en salir, eliminamos la sala
    console.log(`Se ha cerrado la sala ${code}`);

    rooms.delete(code);
  }

  return room;
};

export const getRoom = (code: string): GameState | null => {
  const room = rooms.get(code);
  if (!room) return null;
  return room;
};
