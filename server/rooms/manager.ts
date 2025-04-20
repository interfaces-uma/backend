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

export const getRoom = (code: string): GameState | null => {
  const room = rooms.get(code);
  if (!room) return null;
  return room;
};
