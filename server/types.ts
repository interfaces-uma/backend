export type CardColor = "red" | "blue" | "black" | "empty";
export type Role = "leader" | "agent" | "spectator";
export type TeamColor = "red" | "blue" | null;
export type GameMode = "online" | "tutorial";

export type Message = {
  team: string;
  user: string;
  message: string;
};

export type Teams = {
  blue: {
    leader: User | null;
    agents: User[];
  };
  red: {
    leader: User | null;
    agents: User[];
  };
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
  color: TeamColor;
  role: Role | null;
};

export type GameState = {
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
  clue: {
    word: string;
    count: number;
  } | null;
  messages: Message[];
};
