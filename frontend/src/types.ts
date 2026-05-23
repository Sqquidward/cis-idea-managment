export interface PlanTeamMember {
  display_name: string;
  task: string;
  is_author?: boolean;
}

export interface ProjectPlan {
  deadline: string;
  team: PlanTeamMember[];
}

/** −1 — против, 0 — воздержаться, 1 — за */
export type VoteValue = -1 | 0 | 1;

export interface Idea {
  id: number;
  title: string;
  type: string;
  description: string;
  author: string;
  author_id: string;
  is_owner: boolean;
  status: string;
  rating: number;
  voted: boolean;
  my_vote?: VoteValue | null;
  plan?: ProjectPlan | null;
}

export interface UserSession {
  userId: string;
  username: string;
  displayName: string;
  avatarEmoji: string;
  role: string;
}

export interface UserProfile {
  user_id: string;
  username: string;
  display_name: string;
  avatar_emoji: string;
  role: string;
}

export interface AdminUser {
  user_id: string;
  username: string;
  display_name: string;
  avatar_emoji: string;
  role: string;
}

export interface Feedback {
  id: number;
  idea_id: number;
  idea_title: string;
  user_id: string;
  author_name: string;
  rating: number;
  text: string;
  is_mine: boolean;
  created_at: string;
}

export interface UserCreatePayload {
  username: string;
  display_name: string;
  password: string;
  role: string;
}

export type TabId =
  | "screen1"
  | "screen2"
  | "screen3"
  | "screen4"
  | "screen5"
  | "screen6"
  | "screen7";
