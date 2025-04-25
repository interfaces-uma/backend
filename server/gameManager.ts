import { getRoom } from "./roomManager";
import type { Card, Clue, GameState } from "./types";

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
export const gameManager = () => {
  /**
   * Modifica el estado del juego para iniciar la partida.
   * Llama a generateBoard para generar el tablero inicial.
   * @param roomCode - Código de la sala
   */
  const startGame = (roomCode: string) => { };

  /**
   * Modifica el estado del juego para seleccionar una carta.
   * Comprueba y ejecuta endGame si se ha llegado a la condición de victoria.
   *
   * @param roomCode - Código de la sala
   * @param card - Carta seleccionada
   */
  const selectCard = (roomCode: string, card: Card) => { };

  /**
   * Modifica el estado del juego para finalizar la partida.
   * Manda un evento updateState al frontend
   * @param roomCode - Código de la sala
   */
  const endGame = (roomCode: string) => { };

  /**
   * Modifica el estado del juego para generar un nuevo tablero.
   * Manda un evento updateState al frontend
   * @param roomCode - Código de la sala
   */
  const generateBoard = (roomCode: string) => { };

  /**
   * Modifica el estado del juego para establecer una pista.
   * Manda un evento updateState al frontend
   * @param roomCode - Código de la sala
   * @param clue - Pista
   */
  const setClue = (roomCode: string, pista: Clue) => { };

  /**
   * Modifica el estado del juego para cambiar el turno.
   * Manda un evento updateState al frontend
   * @param roomCode - Código de la sala
   */
  const changeTurn = (roomCode: string) => { };

  /**
   * Modifica el estado del juego para reiniciar la partida.
   * Genera un nuevo tablero y establece el turno inicial.
   * Manda un evento updateState al frontend
   * @param roomCode - Código de la sala
   */
  const resetGame = (roomCode: string) => { };

  /**
   * Devuelve el estado del juego.
   * @param roomCode - Código de la sala
   * @returns El estado del juego o null si no existe
   */
  const getGameState = (roomCode: string): GameState | null => {
    return getRoom(roomCode);
  };

  return {
    startGame,
    selectCard,
    endGame,
    generateBoard,
    setClue,
    changeTurn,
    resetGame,
    getGameState,
  };
};
