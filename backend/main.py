"""Точка входа backend-модуля для документации Sphinx."""

from voting_service import get_voting_service_status


def healthcheck() -> dict[str, str]:
    """Проверить доступность backend.

    :return: Статус backend и сервиса голосования.
    :rtype: dict[str, str]
    """
    voting_status = get_voting_service_status()
    return {
        "backend": "ok",
        "voting_service": voting_status["status"],
    }
