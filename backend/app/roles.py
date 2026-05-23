from __future__ import annotations

from enum import Enum


class UserRole(str, Enum):
    ADMIN = "Админ"
    USER = "Пользователь"
    COMMITTEE = "Комитет"
