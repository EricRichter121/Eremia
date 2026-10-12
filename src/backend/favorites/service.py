from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from backend.astronomical_objects.models import AstronomicalObject
from backend.database.errors import IntegrityConflictError, integrity_constraint_name
from backend.favorites.models import Favorite

FAVORITE_UNIQUE_CONSTRAINT = "uq_favorites_user_id_astronomical_object_id"


class AstronomicalObjectNotFoundError(Exception):
    """Raised when the requested astronomical object does not exist."""


class FavoriteNotFoundError(Exception):
    """Raised when a user does not have the requested favorite."""


class DuplicateFavoriteError(Exception):
    """Raised when a user already favorites the requested object."""


async def list_for_user(
    session: AsyncSession, user_id: int
) -> list[Favorite]:
    """Load a user's favorites with the nested object type ready for serialization."""
    statement = (
        select(Favorite)
        .options(
            selectinload(Favorite.astronomical_object).selectinload(
                AstronomicalObject.object_type
            )
        )
        .where(Favorite.user_id == user_id)
        .order_by(Favorite.created_at.desc(), Favorite.id.desc())
    )
    result = await session.scalars(statement)
    return list(result)


async def create(
    session: AsyncSession, user_id: int, object_id: int
) -> Favorite:
    """Create a favorite owned by the authenticated user."""
    astronomical_object = await session.get(AstronomicalObject, object_id)
    if astronomical_object is None:
        raise AstronomicalObjectNotFoundError

    favorite = Favorite(
        user_id=user_id,
        astronomical_object=astronomical_object,
    )
    session.add(favorite)
    try:
        await session.commit()
    except IntegrityError as error:
        await session.rollback()
        if integrity_constraint_name(error) == FAVORITE_UNIQUE_CONSTRAINT:
            raise DuplicateFavoriteError from error
        raise IntegrityConflictError from error
    return favorite


async def delete_for_user(
    session: AsyncSession, user_id: int, object_id: int
) -> None:
    """Delete only the matching favorite belonging to the authenticated user."""
    statement = select(Favorite).where(
        Favorite.user_id == user_id,
        Favorite.astronomical_object_id == object_id,
    )
    favorite = await session.scalar(statement)
    if favorite is None:
        raise FavoriteNotFoundError

    await session.delete(favorite)
    try:
        await session.commit()
    except IntegrityError as error:
        await session.rollback()
        raise IntegrityConflictError from error
