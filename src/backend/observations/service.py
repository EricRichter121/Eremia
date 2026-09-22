from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from backend.observations.models import ObservationLog
from backend.observations.schemas import ObservationLogCreate


class ObservationNotFoundError(Exception):
	"""Raised when an observation does not exist."""


async def get_by_id(
	session: AsyncSession, observation_id: int
) -> ObservationLog:
	"""Load an observation or raise a domain-level not-found error."""
	observation = await session.get(ObservationLog, observation_id)
	if observation is None:
		raise ObservationNotFoundError
	return observation


async def list_all(
	session: AsyncSession,
	astronomical_object_id: int | None,
	skip: int,
	limit: int,
) -> list[ObservationLog]:
	"""Return observations ordered from newest to oldest."""
	statement = (
		select(ObservationLog)
		.order_by(ObservationLog.observed_at.desc())
		.offset(skip)
		.limit(limit)
	)
	if astronomical_object_id is not None:
		statement = statement.where(
			ObservationLog.astronomical_object_id == astronomical_object_id
		)
	result = await session.scalars(statement)
	return list(result)


async def create(
	session: AsyncSession, payload: ObservationLogCreate
) -> ObservationLog:
	"""Persist a new observation and commit its transaction."""
	observation = ObservationLog(**payload.model_dump())
	session.add(observation)
	try:
		await session.commit()
	except IntegrityError:
		await session.rollback()
		raise
	return observation


async def update(
	session: AsyncSession,
	observation: ObservationLog,
	payload: ObservationLogCreate,
) -> ObservationLog:
	"""Update an observation and commit its replacement fields."""
	for field, value in payload.model_dump().items():
		setattr(observation, field, value)
	try:
		await session.commit()
	except IntegrityError:
		await session.rollback()
		raise
	return observation


async def delete(session: AsyncSession, observation: ObservationLog) -> None:
	"""Delete an observation and commit the transaction."""
	await session.delete(observation)
	await session.commit()