#!/usr/bin/env python3
"""Наполнение БД демо-данными (идемпотентно)."""
from app.database import SessionLocal
from app.seed import seed_database


def main() -> None:
    with SessionLocal() as db:
        seed_database(db)
    print("База данных наполнена демо-данными.")


if __name__ == "__main__":
    main()
