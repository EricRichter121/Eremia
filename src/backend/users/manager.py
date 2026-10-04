from fastapi_users import BaseUserManager, IntegerIDMixin

from backend.core.config import settings
from backend.users.models import User


class UserManager(IntegerIDMixin, BaseUserManager[User, int]):
    reset_password_token_secret = settings.jwt_secret.get_secret_value()
    verification_token_secret = settings.jwt_secret.get_secret_value()