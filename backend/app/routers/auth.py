from fastapi import APIRouter, HTTPException, status

from app.models import LoginRequest, LoginResponse

router = APIRouter(prefix="/api/auth", tags=["auth"])

VALID_CREDENTIALS = {"Admin": "12345"}


@router.post("/login", response_model=LoginResponse)
def login(payload: LoginRequest) -> LoginResponse:
    password = VALID_CREDENTIALS.get(payload.username.strip())
    if password is None or password != payload.password.strip():
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неверный логин или пароль!",
        )
    return LoginResponse(username="Admin", display_name="Admin (Пользователь)")
