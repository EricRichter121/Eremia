from sqlalchemy import or_, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from backend.astronomical_objects.models import AstronomicalObject
from backend.astronomical_objects.schemas import AstronomicalObjectCreate
from backend.database.errors import IntegrityConflictError, integrity_constraint_name
from backend.object_types.models import ObjectType


class AstronomicalObjectNotFoundError(Exception):
	"""Raised when an astronomical object does not exist."""


class DuplicateCatalogIdError(Exception):
	"""Raised when a catalog identifier is already in use."""


async def get_by_id(
	session: AsyncSession, object_id: int
) -> AstronomicalObject:
	"""Load an object with its type eagerly loaded for the response schema."""
	statement = (
		select(AstronomicalObject)
		.options(selectinload(AstronomicalObject.object_type))
		.where(AstronomicalObject.id == object_id)
	)
	astronomical_object = await session.scalar(statement)
	if astronomical_object is None:
		raise AstronomicalObjectNotFoundError
	return astronomical_object


async def list_all(
	session: AsyncSession,
	object_type_id: int | None,
	skip: int,
	limit: int,
	search: str | None = None,
) -> list[AstronomicalObject]:
	"""Query objects in name order with optional search, type filtering, and pagination."""
	statement = (
		select(AstronomicalObject)
		.options(selectinload(AstronomicalObject.object_type))
		.order_by(AstronomicalObject.name)
		.offset(skip)
		.limit(limit)
	)
	if object_type_id is not None:
		statement = statement.where(
			AstronomicalObject.object_type_id == object_type_id
		)
	search_term = search.strip() if search is not None else ""
	if search_term:
		escaped_search = (
			search_term.replace("!", "!!").replace("%", "!%").replace("_", "!_")
		)
		search_pattern = f"%{escaped_search}%"
		statement = statement.where(
			or_(
				AstronomicalObject.name.ilike(search_pattern, escape="!"),
				AstronomicalObject.catalog_id.ilike(
					search_pattern, escape="!"
				),
				AstronomicalObject.description.ilike(
					search_pattern, escape="!"
				),
				AstronomicalObject.object_type.has(
					ObjectType.name.ilike(search_pattern, escape="!")
				),
			)
		)
	result = await session.scalars(statement)
	return list(result)


async def create(
	session: AsyncSession, payload: AstronomicalObjectCreate
) -> AstronomicalObject:
	"""Persist a new object and translate uniqueness failures into a domain error."""
	astronomical_object = AstronomicalObject(**payload.model_dump())
	session.add(astronomical_object)
	try:
		await session.commit()
	except IntegrityError as error:
		await session.rollback()
		if integrity_constraint_name(error) == "astronomical_objects_catalog_id_key":
			raise DuplicateCatalogIdError from error
		raise IntegrityConflictError from error
	return await get_by_id(session, astronomical_object.id)


async def update(
	session: AsyncSession,
	astronomical_object: AstronomicalObject,
	payload: AstronomicalObjectCreate,
) -> AstronomicalObject:
	"""Apply replacement fields, commit them, and reload the response object."""
	for field, value in payload.model_dump().items():
		setattr(astronomical_object, field, value)
	try:
		await session.commit()
	except IntegrityError as error:
		await session.rollback()
		if integrity_constraint_name(error) == "astronomical_objects_catalog_id_key":
			raise DuplicateCatalogIdError from error
		raise IntegrityConflictError from error
	return await get_by_id(session, astronomical_object.id)


async def delete(
	session: AsyncSession, astronomical_object: AstronomicalObject
) -> None:
	"""Delete an object and commit the relationship cascade."""
	await session.delete(astronomical_object)
	try:
		await session.commit()
	except IntegrityError as error:
		await session.rollback()
		raise IntegrityConflictError from error