export type CardColor = "red" | "blue" | "black" | "empty";
export type Role = "leader" | "agent" | "spectator";
export type TeamColor = "red" | "blue" | null;
export type GameMode = "online" | "tutorial";

export type Message = {
  team: string;
  user: string;
  message: string;
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
  code: string;
  user: User;
  players: User[];
  teams: {
    blue: {
      leader: User;
      agents: User[];
    };
    red: {
      leader: User;
      agents: User[];
    };
  };
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
