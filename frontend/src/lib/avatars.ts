export const DEFAULT_AVATAR_EMOJI = "👤";

/** Синхронизировано с backend/app/avatars.py */
export const AVATAR_EMOJIS = [
  "👤",
  "😀",
  "😎",
  "🤓",
  "🧑‍💼",
  "👩‍💻",
  "🧑‍🔬",
  "💡",
  "🚀",
  "⭐",
  "🎯",
  "🏆",
  "📊",
  "🔧",
  "⚙️",
  "🛡️",
  "👑",
  "🌟",
  "💼",
  "📝",
  "🎨",
  "🔬",
  "🌱",
  "🐱",
  "🐶",
  "🦊",
  "🐻",
  "🦁",
  "🐼",
  "🦄",
] as const;

export type AvatarEmoji = (typeof AVATAR_EMOJIS)[number];
