from __future__ import annotations

from copy import deepcopy

from app.models import Idea, IdeaCreate, IdeaStatus


class IdeaStore:
    def __init__(self) -> None:
        self._ideas: list[dict] = [
            {
                "id": 101,
                "title": "Оптимизация работы столовой предприятия",
                "type": "Организационная",
                "description": (
                    "Внедрение мобильного терминала предварительного заказа блюд "
                    "для снижения очередей в обеденные перерывы сотрудников банка."
                ),
                "author": "Куликова И. В.",
                "status": IdeaStatus.VOTING.value,
                "rating": 15,
                "voted": False,
            },
            {
                "id": 102,
                "title": "Внедрение нового отказоустойчивого VPN-клиента",
                "type": "Технологическая",
                "description": (
                    "Замена текущего VPN-сервиса на современный клиент с поддержкой "
                    "асинхронного шифрования для повышения стабильности удалённых сессий."
                ),
                "author": "Мухаяров В. А.",
                "status": IdeaStatus.IMPLEMENTATION.value,
                "rating": 32,
                "voted": True,
            },
        ]
        self._next_id = 103

    def list_ideas(self) -> list[Idea]:
        return [Idea(**deepcopy(item)) for item in self._ideas]

    def get_idea(self, idea_id: int) -> Idea | None:
        for item in self._ideas:
            if item["id"] == idea_id:
                return Idea(**deepcopy(item))
        return None

    def create_idea(self, payload: IdeaCreate, author: str) -> Idea:
        idea = {
            "id": self._next_id,
            "title": payload.title.strip(),
            "type": payload.type,
            "description": payload.description.strip(),
            "author": author,
            "status": IdeaStatus.VOTING.value,
            "rating": 0,
            "voted": False,
        }
        self._next_id += 1
        self._ideas.append(idea)
        return Idea(**deepcopy(idea))

    def vote(self, idea_id: int, delta: int) -> Idea | None:
        for item in self._ideas:
            if item["id"] != idea_id:
                continue
            if item["status"] != IdeaStatus.VOTING.value or item["voted"]:
                return None
            item["rating"] += delta
            item["voted"] = True
            return Idea(**deepcopy(item))
        return None

    def update_status(self, idea_id: int, status: str) -> Idea | None:
        for item in self._ideas:
            if item["id"] == idea_id:
                item["status"] = status
                return Idea(**deepcopy(item))
        return None

    def save_plan(self, idea_id: int) -> Idea | None:
        for item in self._ideas:
            if item["id"] == idea_id and item["status"] == IdeaStatus.IMPLEMENTATION.value:
                item["status"] = IdeaStatus.DONE.value
                return Idea(**deepcopy(item))
        return None


store = IdeaStore()
