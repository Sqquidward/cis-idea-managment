from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.avatars import DEFAULT_AVATAR_EMOJI, is_valid_avatar_emoji
from app.database import get_db
from app.db_models import User
from app.deps import get_current_user, require_roles
from app.models import UserAdmin, UserCreate, UserProfile, UserProfileUpdate
from app.roles import UserRole
from app.security import hash_password

router = APIRouter(prefix="/api/users", tags=["users"])

_ADMIN_ONLY = (UserRole.ADMIN,)
_VALID_ROLES = {role.value for role in UserRole}


def _to_admin(user: User) -> UserAdmin:
    return UserAdmin(
        user_id=str(user.id),
        username=user.username,
        display_name=user.display_name,
        avatar_emoji=user.avatar_emoji,
        role=user.role,
    )


def _to_profile(user: User) -> UserProfile:
    return UserProfile(
        user_id=str(user.id),
        username=user.username,
        display_name=user.display_name,
        avatar_emoji=user.avatar_emoji,
        role=user.role,
    )


@router.get("/me", response_model=UserProfile)
def get_profile(user: User = Depends(get_current_user)) -> UserProfile:
    return _to_profile(user)


@router.patch("/me", response_model=UserProfile)
def update_profile(
    payload: UserProfileUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> UserProfile:
    if payload.display_name is None and payload.avatar_emoji is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Укажите имя или аватар для изменения",
        )

    if payload.display_name is not None:
        name = payload.display_name.strip()
        if len(name) < 2:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Имя должно содержать не менее 2 символов",
            )
        user.display_name = name

    if payload.avatar_emoji is not None:
        emoji = payload.avatar_emoji.strip()
        if not is_valid_avatar_emoji(emoji):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Выберите аватар из предложенного списка",
            )
        user.avatar_emoji = emoji

    db.add(user)
    db.commit()
    db.refresh(user)
    return _to_profile(user)


@router.get("", response_model=list[UserAdmin])
def list_users(
    _admin: User = Depends(require_roles(*_ADMIN_ONLY)),
    db: Session = Depends(get_db),
) -> list[UserAdmin]:
    rows = db.scalars(select(User).order_by(User.username)).all()
    return [_to_admin(row) for row in rows]


@router.post("", response_model=UserAdmin, status_code=status.HTTP_201_CREATED)
def create_user(
    payload: UserCreate,
    _admin: User = Depends(require_roles(*_ADMIN_ONLY)),
    db: Session = Depends(get_db),
) -> UserAdmin:
    username = payload.username.strip()
    display_name = payload.display_name.strip()
    password = payload.password.strip()
    role = payload.role.strip()

    if role not in _VALID_ROLES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Роль должна быть одной из: {', '.join(sorted(_VALID_ROLES))}",
        )

    existing = db.scalar(select(User).where(User.username == username))
    if existing is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Пользователь с таким логином уже существует",
        )

    user = User(
        username=username,
        password_hash=hash_password(password),
        display_name=display_name,
        avatar_emoji=DEFAULT_AVATAR_EMOJI,
        role=role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return _to_admin(user)
