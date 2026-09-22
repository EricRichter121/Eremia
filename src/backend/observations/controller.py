from sqlalchemy.ext.asyncio import AsyncSession

from backend.astronomical_objects.models import AstronomicalObject
from backend.observations import service
from backend.observations.models import ObservationLog
from backend.observations.schemas import ObservationLogCreate


class AstronomicalObjectNotFoundError(Exception):
	"""Raised when an observation's astronomical object does not exist."""


async def list_observations(
	session: AsyncSession,
	astronomical_object_id: int | None,
	skip: int,
	limit: int,
) -> list[ObservationLog]:
	"""Coordinate listing observations with optional parent filtering."""
	return await service.list_all(
		session, astronomical_object_id, skip, limit
	)


async def get_observation(
	session: AsyncSession, observation_id: int
) -> ObservationLog:
	"""Coordinate loading one observation."""
	return await service.get_by_id(session, observation_id)


async def create_observation(
	session: AsyncSession, payload: ObservationLogCreate
) -> ObservationLog:
	"""Validate the parent object before creating an observation."""
	await _ensure_astronomical_object_exists(
		session, payload.astronomical_object_id
	)
	return await service.create(session, payload)


async def replace_observation(
	session: AsyncSession,
	observation_id: int,
	payload: ObservationLogCreate,
) -> ObservationLog:
	"""Load, validate, and replace an existing observation."""
	observation = await service.get_by_id(session, observation_id)
	await _ensure_astronomical_object_exists(
		session, payload.astronomical_object_id
	)
	return await service.update(session, observation, payload)


async def delete_observation(
	session: AsyncSession, observation_id: int
) -> None:
	"""Load and delete an observation."""
	observation = await service.get_by_id(session, observation_id)
	await service.delete(session, observation)


async def _ensure_astronomical_object_exists(
	session: AsyncSession, object_id: int
) -> None:
	if await session.get(AstronomicalObject, object_id) is None:
		raise AstronomicalObjectNotFoundError