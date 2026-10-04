from fastapi import APIRouter, Depends

from backend.users.auth import auth_backend, fastapi_users
from backend.users.models import User
from backend.users.schemas import UserCreate, UserRead

router = APIRouter()

router.include_router(
    fastapi_users.get_register_router(UserRead, UserCreate),
    prefix="/auth",
    tags=["auth"],
)
router.include_router(
    fastapi_users.get_auth_router(auth_backend),
    prefix="/auth/jwt",
    tags=["auth"],
)

current_active_user = fastapi_users.current_user(active=True)


@router.get("/users/me", response_model=UserRead, tags=["users"])
async def read_current_user(
    user: User = Depends(current_active_user),
) -> User:
    return user