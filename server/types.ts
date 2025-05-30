export type CardColor = "red" | "blue" | "black" | "empty";
export type Role = "leader" | "agent" | "spectator";
export type TeamColor = "red" | "blue";
export type GameMode = "online" | "tutorial";

export type Clue = {
  word: string;
  cards: Card[];
} | null;

type minimapCell = {
  color: "red" | "blue" | "black" | "empty";
};
export type minimap = {
  minimap: minimapCell[][];
};

export type Teams = {
  blue: {
    leader: User | null;
    agents: User[];
    clueList: Clue[];
  };
  red: {
    leader: User | null;
    agents: User[];
    clueList: Clue[];
  };
};

export type Message = {
  team: string;
  user: string;
  message: string;
  isLog?: boolean;
};

export type Card = {
  word: string;
  color: CardColor;
  isSelected: boolean;
  isFlipped: boolean;
  // handleClickCard?: (word: string) => void;
};

export type Board = {
  cards: Card[];
};

export type User = {
  id: string;
  name: string;
  color: TeamColor | null;
  role: Role | null;
};

/**
 * Define el estado de una partida
 */
export type GameState = {
  isGameStarted: boolean;
  mode: GameMode;
  code: string;
  user: User;
  players: User[];
  teams: Teams;
  cards: Card[];
  turn: {
    team: TeamColor;
    role: Role;
  };
  clue: Clue;
  messages: Message[];
};

export interface ClientToServerEvents {
  joinRoom: (
    user: User,
    code: string,
    callback: (response: { success: boolean; message?: string }) => void,
  ) => void;
  createRoom: (
    user: User,
    callback: (response: { success: boolean; message?: string }) => void,
  ) => void;
  leaveRoom: (user: User, code: string) => void;
  joinTeam: (
    data: { user: User; color: TeamColor; role: Role },
    code: string,
    callback: (response: { success: boolean; message?: string }) => void,
  ) => void;
  sendMessage: (message: Message, roomCode: string) => void;
  startGame: (
    roomCode: string,
    callback: (response: { success: boolean; message?: string }) => void,
  ) => void;
  sendClue: (clue: Clue) => void;
  guessCard: (card: Card) => void;
  leaveTeam: (code: string, user: User) => void;
  nextTurn: () => void;
  resetGame: (roomCode: string, user: User) => void;
}

export interface ServerToClientEvents {
  updateState: (state: GameState) => void;
  redirectGame: () => void;
  redirectLobby: () => void;
  endGame: (state: GameState, winner: TeamColor) => void;
  updateMessages: (message: Message) => void;
}
