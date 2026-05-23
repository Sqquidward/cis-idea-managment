"""Допустимые эмодзи для аватара пользователя."""

DEFAULT_AVATAR_EMOJI = "👤"

ALLOWED_AVATAR_EMOJIS: frozenset[str] = frozenset(
    [
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
    ]
)


def is_valid_avatar_emoji(value: str) -> bool:
    return value in ALLOWED_AVATAR_EMOJIS
