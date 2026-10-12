from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from backend.api.dependencies import get_db_session
from backend.database.errors import IntegrityConflictError
from backend.favorites import controller
from backend.favorites.schemas import FavoriteCreate, FavoriteRead
from backend.favorites.service import (
    AstronomicalObjectNotFoundError,
    DuplicateFavoriteError,
    FavoriteNotFoundError,
)
from backend.users.auth import current_active_user
from backend.users.models import User

router = APIRouter(prefix="/favorites", tags=["favorites"])


@router.get("", response_model=list[FavoriteRead])
async def list_favorites(
    session: AsyncSession = Depends(get_db_session),
    user: User = Depends(current_active_user),
):
    """Return the authenticated user's favorites."""
    return await controller.list_favorites(session, user.id)


@router.post(
    "",
    response_model=FavoriteRead,
    status_code=status.HTTP_201_CREATED,
)
async def create_favorite(
    payload: FavoriteCreate,
    session: AsyncSession = Depends(get_db_session),
    user: User = Depends(current_active_user),
):
    """Favorite an existing catalog object for the authenticated user."""
    try:
        return await controller.create_favorite(
            session, user.id, payload.astronomical_object_id
        )
    except AstronomicalObjectNotFoundError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Astronomical object not found",
        ) from error
    except DuplicateFavoriteError as error:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This astronomical object is already in your favorites",
        ) from error
    except IntegrityConflictError as error:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="The operation conflicts with existing database records",
        ) from error


@router.delete(
    "/{object_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_favorite(
    object_id: int,
    session: AsyncSession = Depends(get_db_session),
    user: User = Depends(current_active_user),
) -> None:
    """Remove the authenticated user's favorite without deleting the object."""
    try:
        await controller.delete_favorite(session, user.id, object_id)
    except FavoriteNotFoundError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Favorite not found",
        ) from error
    except IntegrityConflictError as error:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="The operation conflicts with existing database records",
        ) from error
