export interface Idea {
  id: number;
  title: string;
  type: string;
  description: string;
  author: string;
  status: string;
  rating: number;
  voted: boolean;
}

export interface UserSession {
  username: string;
  displayName: string;
  role: string;
}

export type TabId = "screen1" | "screen2" | "screen3" | "screen4" | "screen5";
