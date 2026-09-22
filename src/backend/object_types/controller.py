from sqlalchemy.ext.asyncio import AsyncSession

from backend.object_types import service
from backend.object_types.models import ObjectType
from backend.object_types.schemas import ObjectTypeCreate


async def list_object_types(session: AsyncSession) -> list[ObjectType]:
	"""Coordinate the object-type listing use case."""
	return await service.list_all(session)


async def get_object_type(
	session: AsyncSession, object_type_id: int
) -> ObjectType:
	"""Coordinate loading one object type."""
	return await service.get_by_id(session, object_type_id)


async def create_object_type(
	session: AsyncSession, payload: ObjectTypeCreate
) -> ObjectType:
	"""Coordinate creation of an object type."""
	return await service.create(session, payload)


async def replace_object_type(
	session: AsyncSession,
	object_type_id: int,
	payload: ObjectTypeCreate,
) -> ObjectType:
	"""Load and replace an existing object type."""
	object_type = await service.get_by_id(session, object_type_id)
	return await service.update(session, object_type, payload)


async def delete_object_type(
	session: AsyncSession, object_type_id: int
) -> None:
	"""Load and delete an object type."""
	object_type = await service.get_by_id(session, object_type_id)
	await service.delete(session, object_type)