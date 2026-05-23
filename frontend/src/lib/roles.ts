import type { TabId } from "../types";

/** Значения role из JWT / API — совпадают с backend UserRole */
export const ROLES = {
  ADMIN: "Админ",
  USER: "Пользователь",
  COMMITTEE: "Комитет",
} as const;

export function isAdmin(role: string): boolean {
  return role === ROLES.ADMIN;
}

export function isUser(role: string): boolean {
  return role === ROLES.USER;
}

export function isCommittee(role: string): boolean {
  return role === ROLES.COMMITTEE;
}

/**
 * Админ — все разделы, включая управление пользователями.
 * Пользователь — новая идея, мои идеи, лента, план, отзыв.
 * Комитет — лента (без голосования) и панель комитета.
 */
const TAB_ACCESS: Record<TabId, readonly string[]> = {
  screen1: [ROLES.ADMIN, ROLES.USER],
  screen6: [ROLES.ADMIN, ROLES.USER],
  screen2: [ROLES.ADMIN, ROLES.USER, ROLES.COMMITTEE],
  screen3: [ROLES.ADMIN, ROLES.COMMITTEE],
  screen4: [ROLES.ADMIN, ROLES.USER],
  screen5: [ROLES.ADMIN, ROLES.USER],
  screen7: [ROLES.ADMIN],
};

export function canAccessTab(role: string, tabId: TabId): boolean {
  return TAB_ACCESS[tabId].includes(role);
}

export function canVote(role: string): boolean {
  return isUser(role) || isAdmin(role);
}

export function getDefaultTab(role: string): TabId {
  if (isAdmin(role)) return "screen7";
  if (isCommittee(role)) return "screen2";
  return "screen1";
}

export function getRoleSubtitle(role: string): string {
  if (isAdmin(role)) return "Режим администратора — полный доступ";
  if (isCommittee(role)) return "Режим экспертного комитета";
  return "Корпоративная система инноваций";
}
