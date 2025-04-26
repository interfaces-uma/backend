/**
 * @module utils
 * Funciones utilitarias para el servidor
 * Estas funciones son utilizadas por el servidor para manejar las salas de juego y los eventos de socket.io.
 * Son funciones que ayudan a gestionar el resto de los modulos.
 *
 */

// se encarga de colorear en la terminal
import chalk from "chalk";

export const logger = {
  /**
   * Muestra un mensaje de log en la consola.
   * Mensajes para debuggear el servidor
   * @param message - Mensaje a mostrar
   * @param context - Contexto del mensaje. Ejemplo: "Socket", "RoomManager", "GameManager"
   */
  debug(message: string, context = "") {
    this._log("DEBUG", message, context, chalk.gray);
  },

  /**
   * Muestra un mensaje informativo en la consola.
   * Mensajes que siempre se deben mostrar, como la creacion de una sala o la union de un jugador.
   * @param message - Mensaje a mostrar
   * @param context - Contexto del mensaje. Ejemplo: "Socket", "RoomManager", "GameManager"
   */
  info(message: string, context = "") {
    this._log("INFO", message, context, chalk.green);
  },

  /**
   * Muestra un mensaje de error en la consola.
   * @param message - Mensaje a mostrar
   * @param context - Contexto del mensaje. Ejemplo: "Socket", "RoomManager", "GameManager"
   */
  error(message: string, context = "") {
    this._log("ERROR", message, context, chalk.red);
  },

  _log(
    level: string,
    message: string,
    context: string,
    colorFunction: (chalk: unknown) => string,
  ) {
    const timestamp = chalk.magenta(this._getTimestamp());
    const parts = [`[${timestamp}]`, colorFunction(`[${level}]`)];

    if (context) {
      parts.push(colorFunction(`[${context}]`));
    }

    parts.push(colorFunction(message));

    const logMessage = parts.join(" ");

    if (level === "ERROR") {
      console.error(logMessage);
    } else {
      console.log(logMessage);
    }
  },

  _getTimestamp() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  },
};
