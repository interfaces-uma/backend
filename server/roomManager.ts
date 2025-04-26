import type { GameState, User } from "./types";
import { logger } from "./utils";

/**
 * Objeto que almacena las salas de juego.
 * Cada sala tiene un codigo unico y un estado de juego asociado.
 * El estado de juego contiene la informacion de los jugadores, equipos, cartas, turno, pista y mensajes.
 */
const rooms = new Map<string, GameState>();

export interface RoomManager {
  createRoom: (code: string, user: User) => GameState;
  joinRoom: (code: string, user: User) => GameState | null;
  leaveRoom: (code: string, user: User) => GameState | null;
  getRoom: (code: string) => GameState | null;
}

/**
 * Room Manager Module
 * Modulo encargado de gestionar las salas de juego.
 *
 * @example
 * const room = roomManager();
 * room.createRoom("1234", { name: "miguel", color: "red" });
 * room.joinRoom("1234", { name: "mario", color: "blue" });
 * room.leaveRoom("1234", { name: "mario", color: "blue" });
 * room.getRoom("1234");
 *
 */
export const roomManager = (): RoomManager => {
  /**
   * Crea una sala de juego.
   * @param code - Codigo de la sala
   * @param user - Usuario que crea la sala
   * @returns El estado inicial de la sala
   */
  const createRoom = (code: string, user: User): GameState => {
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
    logger.debug(`El usuario ${user.name} creó la sala ${code}`, "RoomManager");

    return initialState;
  };

  /**
   * Se une a una sala de juego.
   * @param code - Codigo de la sala
   * @param user - Usuario que se une a la sala
   * @returns El estado de la sala o null si no existe
   */
  const joinRoom = (code: string, user: User): GameState | null => {
    const room = rooms.get(code);
    if (!room) return null;
    if (!room.players.find((p) => p.id === user.id)) {
      room.players.push(user);
    }

    logger.debug(
      `El usuario ${user.name} se unió a la sala ${code}`,
      "RoomManager",
    );
    return room;
  };

  /**
   * Sale de una sala de juego.
   * @param code - Codigo de la sala
   * @param user - Usuario que sale de la sala
   * @returns El estado de la sala o null si no existe
   */
  const leaveRoom = (code: string, user: User): GameState | null => {
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
    logger.debug(
      `El usuario ${user.name} salió de la sala ${code}`,
      "RoomManager",
    );

    if (room.players.length === 0) {
      //Si somos el ultimo en salir, eliminamos la sala
      logger.debug(`Se ha cerrado la sala ${code}`, "RoomManager");

      rooms.delete(code);
    }

    return room;
  };

  /**
   * Devuelve el estado de la sala.
   * @param code - Codigo de la sala
   * @returns El estado de la sala o null si no existe
   */
  const getRoom = (code: string): GameState | null => {
    const room = rooms.get(code);
    if (!room) return null;
    return room;
  };

  return {
    createRoom,
    joinRoom,
    leaveRoom,
    getRoom,
  };
};
