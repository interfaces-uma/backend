import type { GameState, User } from "../types";

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
  return initialState;
};

export const joinRoom = (code: string, user: User): GameState | null => {
  const room = rooms.get(code);
  if (!room) return null;
  if (!room.players.find((p) => p.id === user.id)) {
    room.players.push(user);
  }
  return room;
};

export const leaveRoom = (code: string, user: User): GameState | null => {
  const room = rooms.get(code);
  if (!room) return null;
  room.players = room.players.filter((p) => p.id !== user.id);

  if (room.players.length === 0) {
    //Si somos el ultimo en salir, eliminamos la sala
    rooms.delete(code);
  }

  return room;
};

export const getRoom = (code: string): GameState | null => {
  const room = rooms.get(code);
  if (!room) return null;
  return room;
};
