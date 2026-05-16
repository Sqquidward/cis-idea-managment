import type { Idea } from "../types";

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });

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

export const api = {
  login(username: string, password: string) {
    return request<{ username: string; display_name: string }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
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

  vote(ideaId: number, delta: 1 | -1) {
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

  savePlan(ideaId: number, deadline: string, tasks: Record<string, string>) {
    return request<Idea>(`/api/ideas/${ideaId}/plan`, {
      method: "POST",
      body: JSON.stringify({ deadline, tasks }),
    });
  },

  submitFeedback(ideaId: number, rating: number, text: string) {
    return request<{ message: string }>("/api/feedbacks", {
      method: "POST",
      body: JSON.stringify({ idea_id: ideaId, rating, text }),
    });
  },
};
