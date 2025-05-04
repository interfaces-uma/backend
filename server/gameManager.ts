import { roomManager } from "./roomManager";
import type { Card, Clue, GameState, TeamColor, User } from "./types";
import { generateCards } from "./words";
import { io } from "./index";

// Metodos a usar del roomManager
const { getRoom } = roomManager();

/**
 * Game Manager Interface
 * Interfaz que define las funciones del Game Manager.
 * @interface GameManager
 */
export interface GameManager {
  startGame: (state: GameState) => void;
  revealCard: (state: GameState, card: Card) => void;
  endGame: (state: GameState, winner: TeamColor) => void;
  generateBoard: (state: GameState) => void;
  setClue: (state: GameState, clue: Clue) => void;
  changeTurn: (state: GameState) => void;
  resetGame: (state: GameState) => void;
  getGameState: (roomCode: string) => GameState | null;
  leaveTeam: (state: GameState, user: User) => void;
  getOppositeTeam: (team: TeamColor) => TeamColor;
}

/**
 * Game Manager Module
 * Modulo encargado de gestionar el estado del juego y la lógica del mismo.
 *
 * @example
 * const game = gameManager();
 * game.startGame("1234");
 * game.selectCard("1234", { word: "carta1", color: "red", isSelected: false, isFlipped: false });
 * game.endGame("1234");
 * game.generateBoard("1234");
 * game.setClue("1234", { word: "pista", count: 2 });
 * game.changeTurn("1234");
 * game.resetGame("1234");
 * game.getGameState("1234");
 *
 */
export const gameManager = (): GameManager => {
  let cont = 0;

  /**
   * Modifica el estado del juego para iniciar la partida.
   * Llama a generateBoard para generar el tablero inicial.
   * @param state - Estado de la partida a actualizar
   */
  const startGame = (state: GameState) => {
    generateBoard(state);
    state.messages.push({
      team: "",
      user: "",
      message: `Empieza la partida! Turno del capitan del equipo ${state.turn.team}`,
      isLog: true,
    });
  };

  /**
   * Modifica el estado del juego para seleccionar una carta.
   * Comprueba y ejecuta endGame si se ha llegado a la condición de victoria.
   *
   * @param state - Estado de la partida a actualizar
   * @param card - Carta seleccionada
   */
  const revealCard = (state: GameState, card: Card) => {
    let sameColor = false;
    let blackCard = false;

    state.cards.map((c) => {
      if (c.word === card.word) {
        cont++;
        c.isFlipped = true;
        if (c.color !== state.turn.team) {
          sameColor = true;
          if (c.color === "black") {
            blackCard = true;
          }
        }
      }
      return c;
    });

    if (state.clue !== null) {
      state.clue.cards.map((c) => {
        if (c.word === card.word) {
          c.isFlipped = true;
        }
        return c;
      });
    }

    if (blackCard) {
      state.messages.push({
        team: "",
        user: "",
        message: `El jugador ${state.turn.team} ha revelado la carta negra, el equipo ${state.turn.team} ha perdido.`,
        isLog: true,
      });
      endGame(state, getOppositeTeam(state.turn.team));
    } else if (!sameColor) {
      changeTurn(state);
      state.messages.push({
        team: "",
        user: "",
        message: `El equipo ${state.turn.team} ha revelado una carta del equipo contrario, pierde el turno.`,
        isLog: true,
      });
    } else {
      if (
        state.cards.filter((c) => c.isFlipped && c.color === state.turn.team)
          .length === 0
      ) {
        endGame(state, state.turn.team);
      }

      if (
        state.clue?.cards.length !== undefined &&
        cont === state.clue?.cards.length + 1
      ) {
        changeTurn(state);
        state.messages.push({
          team: "",
          user: "",
          message: "Limite de cartas reveladas alcanzado.",
          isLog: true,
        });
      }
    }
  };

  /**
   * Modifica el estado del juego para finalizar la partida.
   * @param state - Estado de la partida a actualizar
   */
  const endGame = (state: GameState, winner: TeamColor) => {
    //  Hay que definir en el type endGame
    // io.to(state.code).emit("endGame", state, winner);
  };

  /**
   * Modifica el estado del juego para generar un nuevo tablero.
   * @param state - Estado de la partida a actualizar
   */
  const generateBoard = (state: GameState) => {
    const { board, teamColor } = generateCards();
    state.cards = board;
    state.turn = {
      team: teamColor,
      role: "leader",
    };
  };

  /**
   * Modifica el estado del juego para establecer una pista.
   * @param state - Estado de la partida a actualizar
   * @param clue - Pista
   */
  const setClue = (state: GameState, pista: Clue) => {
    state.clue = pista;
    state.teams[state.turn.team].clueList.push(pista);
    if (pista === null) return;
    state.messages.push({
      team: "",
      user: "",
      message: `El capitan del equipo ${state.turn.team} ha dado la pista: \n ${pista.word} (${pista.cards.length})`,
      isLog: true,
    });
  };

  /**
   * Modifica el estado del juego para cambiar el turno.
   * @param state - Estado de la partida a actualizar
   */
  const changeTurn = (state: GameState) => {
    cont = 0;

    if (state.turn.role === "leader") {
      state.turn.role = "agent";
      state.messages.push({
        team: "",
        user: "",
        message: `Turno de los agentes del equipo ${state.turn.team}`,
        isLog: true,
      });
    } else {
      state.clue = null;
      state.turn.role = "leader";
      state.turn.team = state.turn.team === "red" ? "blue" : "red";
      state.messages.push({
        team: "",
        user: "",
        message: `Turno del capitan del equipo ${state.turn.team}`,
        isLog: true,
      });
    }
  };

  /**
   * Modifica el estado del juego para reiniciar la partida.
   * Genera un nuevo tablero y establece el turno inicial.
   * @param roomCode - Código de la sala
   * @param state - Estado de la partida a actualizar
   */
  const resetGame = (state: GameState) => {
    state.cards = [];
    state.clue = null;
    generateBoard(state);
  };

  /**
   * Devuelve el estado del juego.
   * @param roomCode - Código de la sala
   * @returns El estado del juego o null si no existe
   */
  const getGameState = (roomCode: string): GameState | null => {
    const state = getRoom(roomCode);
    return state;
  };

  const leaveTeam = (state: GameState, user: User) => {
    if (user.color === null || user.role === "spectator") return;

    if (user.role === "leader") {
      state.teams[user.color].leader = null;
    } else {
      state.teams[user.color].agents = state.teams[user.color].agents.filter(
        (agent) => agent.id !== user.id
      );
    }
    state.players.push(user);
    state.messages.push({
      team: "",
      user: "",
      message: `El jugador ${user.name} abandonó el equipo ${user.color}`,
      isLog: true,
    });
  };

  //para obtener el equipo contrario
  const getOppositeTeam = (team: TeamColor): TeamColor => {
    return team === "red" ? "blue" : "red";
  };

  return {
    startGame,
    revealCard,
    endGame,
    generateBoard,
    setClue,
    changeTurn,
    resetGame,
    getGameState,
    leaveTeam,
    getOppositeTeam,
  };
};
