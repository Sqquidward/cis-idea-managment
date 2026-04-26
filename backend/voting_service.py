def get_voting_service_status() -> dict[str, str]:
    """Вернуть текущий статус сервиса голосования.

    :return: Информация о сервисе и его состоянии.
    :rtype: dict[str, str]
    """
    return {"service": "voting", "status": "initialized"}
