import type {
  AdminUser,
  Feedback,
  Idea,
  PlanTeamMember,
  UserCreatePayload,
  UserProfile,
  VoteValue,
} from "../types";

const TOKEN_KEY = "cis_access_token";

let accessToken: string | null = sessionStorage.getItem(TOKEN_KEY);

export function setAccessToken(token: string | null) {
  accessToken = token;
  if (token) {
    sessionStorage.setItem(TOKEN_KEY, token);
  } else {
    sessionStorage.removeItem(TOKEN_KEY);
  }
}

export function getAccessToken(): string | null {
  return accessToken;
}

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options?.headers as Record<string, string> | undefined),
  };
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const response = await fetch(url, { ...options, headers });

  if (response.status === 401) {
    setAccessToken(null);
  }

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const detail = typeof body.detail === "string" ? body.detail : "Ошибка запроса";
    throw new Error(detail);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export interface LoginResult {
  access_token: string;
  token_type: string;
  user_id: string;
  username: string;
  display_name: string;
  avatar_emoji: string;
  role: string;
}

export const api = {
  login(username: string, password: string) {
    return request<LoginResult>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
  },

  getProfile() {
    return request<UserProfile>("/api/users/me");
  },

  updateProfile(data: { display_name?: string; avatar_emoji?: string }) {
    return request<UserProfile>("/api/users/me", {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  getUsers() {
    return request<AdminUser[]>("/api/users");
  },

  createUser(data: UserCreatePayload) {
    return request<AdminUser>("/api/users", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  getIdeas() {
    return request<Idea[]>("/api/ideas");
  },

  createIdea(data: { title: string; type: string; description: string }) {
    return request<Idea>("/api/ideas", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  vote(ideaId: number, delta: VoteValue) {
    return request<Idea>(`/api/ideas/${ideaId}/vote`, {
      method: "POST",
      body: JSON.stringify({ delta }),
    });
  },

  updateStatus(ideaId: number, status: string) {
    return request<Idea>(`/api/ideas/${ideaId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  },

  savePlan(ideaId: number, deadline: string, team: PlanTeamMember[]) {
    return request<Idea>(`/api/ideas/${ideaId}/plan`, {
      method: "POST",
      body: JSON.stringify({ deadline, team }),
    });
  },

  getFeedbacks() {
    return request<Feedback[]>("/api/feedbacks");
  },

  submitFeedback(ideaId: number, rating: number, text: string) {
    return request<Feedback>("/api/feedbacks", {
      method: "POST",
      body: JSON.stringify({ idea_id: ideaId, rating, text }),
    });
  },
};
