from sqlalchemy.ext.asyncio import AsyncSession

from backend.astronomical_objects import service
from backend.astronomical_objects.models import AstronomicalObject
from backend.astronomical_objects.schemas import AstronomicalObjectCreate
from backend.object_types.models import ObjectType


class ObjectTypeNotFoundError(Exception):
	"""Raised when an astronomical object's type does not exist."""


async def list_astronomical_objects(
	session: AsyncSession,
	object_type_id: int | None,
	skip: int,
	limit: int,
) -> list[AstronomicalObject]:
	"""Coordinate the list-object use case."""
	return await service.list_all(session, object_type_id, skip, limit)


async def get_astronomical_object(
	session: AsyncSession, object_id: int
) -> AstronomicalObject:
	"""Coordinate loading one object for the API layer."""
	return await service.get_by_id(session, object_id)


async def create_astronomical_object(
	session: AsyncSession, payload: AstronomicalObjectCreate
) -> AstronomicalObject:
	"""Validate the related type before creating an object."""
	await _ensure_object_type_exists(session, payload.object_type_id)
	return await service.create(session, payload)


async def replace_astronomical_object(
	session: AsyncSession,
	object_id: int,
	payload: AstronomicalObjectCreate,
) -> AstronomicalObject:
	"""Load, validate, and replace an existing object."""
	astronomical_object = await service.get_by_id(session, object_id)
	await _ensure_object_type_exists(session, payload.object_type_id)
	return await service.update(session, astronomical_object, payload)


async def delete_astronomical_object(
	session: AsyncSession, object_id: int
) -> None:
	"""Load an object and delegate its deletion to the service layer."""
	astronomical_object = await service.get_by_id(session, object_id)
	await service.delete(session, astronomical_object)


async def _ensure_object_type_exists(
	session: AsyncSession, object_type_id: int
) -> None:
	"""Raise a domain error when the requested object type is missing."""
	if await session.get(ObjectType, object_type_id) is None:
		raise ObjectTypeNotFoundError