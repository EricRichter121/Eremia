from fastapi_users import FastAPIUsers
from fastapi_users.authentication import (
    AuthenticationBackend,
    CookieTransport,
    JWTStrategy,
)

from backend.core.config import settings
from backend.users.dependencies import get_user_manager
from backend.users.models import User

JWT_LIFETIME_SECONDS = 3600

cookie_transport = CookieTransport(
    cookie_name="eremia_auth",
    cookie_max_age=JWT_LIFETIME_SECONDS,
    cookie_secure=True,
    cookie_httponly=True,
    cookie_samesite="none",
)


def get_jwt_strategy() -> JWTStrategy[User, int]:
    return JWTStrategy(
        secret=settings.jwt_secret.get_secret_value(),
        lifetime_seconds=JWT_LIFETIME_SECONDS,
    )


auth_backend = AuthenticationBackend(
    name="cookie-jwt",
    transport=cookie_transport,
    get_strategy=get_jwt_strategy,
)

fastapi_users = FastAPIUsers[User, int](get_user_manager, [auth_backend])