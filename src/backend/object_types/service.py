from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from backend.object_types.models import ObjectType
from backend.object_types.schemas import ObjectTypeCreate


class ObjectTypeNotFoundError(Exception):
	"""Raised when an object type does not exist."""


class DuplicateObjectTypeNameError(Exception):
	"""Raised when an object type name is already in use."""


async def get_by_id(session: AsyncSession, object_type_id: int) -> ObjectType:
	"""Load an object type or raise a domain-level not-found error."""
	object_type = await session.get(ObjectType, object_type_id)
	if object_type is None:
		raise ObjectTypeNotFoundError
	return object_type


async def list_all(session: AsyncSession) -> list[ObjectType]:
	"""Return object types ordered alphabetically by name."""
	result = await session.scalars(select(ObjectType).order_by(ObjectType.name))
	return list(result)


async def create(
	session: AsyncSession, payload: ObjectTypeCreate
) -> ObjectType:
	"""Persist an object type and translate unique-name failures."""
	object_type = ObjectType(**payload.model_dump())
	session.add(object_type)
	try:
		await session.commit()
	except IntegrityError as error:
		await session.rollback()
		raise DuplicateObjectTypeNameError from error
	return object_type


async def update(
	session: AsyncSession,
	object_type: ObjectType,
	payload: ObjectTypeCreate,
) -> ObjectType:
	"""Update an object type and commit the replacement fields."""
	for field, value in payload.model_dump().items():
		setattr(object_type, field, value)
	try:
		await session.commit()
	except IntegrityError as error:
		await session.rollback()
		raise DuplicateObjectTypeNameError from error
	return object_type


async def delete(session: AsyncSession, object_type: ObjectType) -> None:
	"""Delete an object type and commit the transaction."""
	await session.delete(object_type)
	await session.commit()