from collections.abc import AsyncGenerator

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from eremia.astronomical_objects.models import AstronomicalObject
from eremia.astronomical_objects.schemas import (
	AstronomicalObjectCreate,
	AstronomicalObjectRead,
)
from eremia.database.db import async_session_factory
from eremia.object_types.models import ObjectType


router = APIRouter(prefix="/astronomical-objects", tags=["astronomical objects"])


async def get_db_session() -> AsyncGenerator[AsyncSession, None]:
	"""Provide one database session for the lifetime of a request."""
	async with async_session_factory() as session:
		yield session


async def get_object_or_404(
	object_id: int, session: AsyncSession
) -> AstronomicalObject:
	"""Load an object and its type, which is required by AstronomicalObjectRead."""
	statement = (
		select(AstronomicalObject)
		.options(selectinload(AstronomicalObject.object_type))
		.where(AstronomicalObject.id == object_id)
	)
	astronomical_object = await session.scalar(statement)
	if astronomical_object is None:
		raise HTTPException(
			status_code=status.HTTP_404_NOT_FOUND,
			detail="Astronomical object not found",
		)
	return astronomical_object


@router.get("", response_model=list[AstronomicalObjectRead])
async def list_astronomical_objects(
	session: AsyncSession = Depends(get_db_session),
	object_type_id: int | None = Query(default=None, ge=1),
	skip: int = Query(default=0, ge=0),
	limit: int = Query(default=100, ge=1, le=100),
) -> list[AstronomicalObject]:
	"""Return a paginated list, optionally filtered by object type."""
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
	result = await session.scalars(statement)
	return list(result)


@router.get("/{object_id}", response_model=AstronomicalObjectRead)
async def read_astronomical_object(
	object_id: int, session: AsyncSession = Depends(get_db_session)
) -> AstronomicalObject:
	"""Return one astronomical object by its database identifier."""
	return await get_object_or_404(object_id, session)


@router.post(
	"",
	response_model=AstronomicalObjectRead,
	status_code=status.HTTP_201_CREATED,
)
async def create_astronomical_object(
	payload: AstronomicalObjectCreate,
	session: AsyncSession = Depends(get_db_session),
) -> AstronomicalObject:
	"""Create an astronomical object after validating its object type."""
	object_type = await session.get(ObjectType, payload.object_type_id)
	if object_type is None:
		raise HTTPException(
			status_code=status.HTTP_404_NOT_FOUND,
			detail="Object type not found",
		)

	astronomical_object = AstronomicalObject(**payload.model_dump())
	session.add(astronomical_object)
	try:
		await session.commit()
	except IntegrityError as error:
		await session.rollback()
		raise HTTPException(
			status_code=status.HTTP_409_CONFLICT,
			detail="An astronomical object with this catalog_id already exists",
		) from error
	return await get_object_or_404(astronomical_object.id, session)


@router.put("/{object_id}", response_model=AstronomicalObjectRead)
async def replace_astronomical_object(
	object_id: int,
	payload: AstronomicalObjectCreate,
	session: AsyncSession = Depends(get_db_session),
) -> AstronomicalObject:
	"""Replace all editable fields on an existing astronomical object."""
	astronomical_object = await get_object_or_404(object_id, session)
	if await session.get(ObjectType, payload.object_type_id) is None:
		raise HTTPException(
			status_code=status.HTTP_404_NOT_FOUND,
			detail="Object type not found",
		)

	for field, value in payload.model_dump().items():
		setattr(astronomical_object, field, value)
	try:
		await session.commit()
	except IntegrityError as error:
		await session.rollback()
		raise HTTPException(
			status_code=status.HTTP_409_CONFLICT,
			detail="An astronomical object with this catalog_id already exists",
		) from error
	return await get_object_or_404(object_id, session)


@router.delete("/{object_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_astronomical_object(
	object_id: int, session: AsyncSession = Depends(get_db_session)
) -> None:
	"""Delete an object and its related observations via the ORM cascade."""
	astronomical_object = await get_object_or_404(object_id, session)
	await session.delete(astronomical_object)
	await session.commit()
