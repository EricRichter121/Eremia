from sqlalchemy.ext.asyncio import AsyncSession

from backend.favorites import service
from backend.favorites.models import Favorite


async def list_favorites(
    session: AsyncSession, user_id: int
) -> list[Favorite]:
    return await service.list_for_user(session, user_id)


async def create_favorite(
    session: AsyncSession, user_id: int, object_id: int
) -> Favorite:
    return await service.create(session, user_id, object_id)


async def delete_favorite(
    session: AsyncSession, user_id: int, object_id: int
) -> None:
    await service.delete_for_user(session, user_id, object_id)
