from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from backend.api.dependencies import get_db_session
from backend.observations import controller
from backend.observations.schemas import ObservationLogCreate, ObservationLogRead
from backend.observations.service import ObservationNotFoundError


router = APIRouter(prefix="/observations", tags=["observations"])


@router.get("", response_model=list[ObservationLogRead])
async def list_observations(
	session: AsyncSession = Depends(get_db_session),
	astronomical_object_id: int | None = Query(default=None, ge=1),
	skip: int = Query(default=0, ge=0),
	limit: int = Query(default=100, ge=1, le=100),
):
	"""Return observations, optionally filtered by astronomical object."""
	return await controller.list_observations(
		session, astronomical_object_id, skip, limit
	)


@router.get("/{observation_id}", response_model=ObservationLogRead)
async def read_observation(
	observation_id: int,
	session: AsyncSession = Depends(get_db_session),
):
	"""Return one observation or a 404 response."""
	try:
		return await controller.get_observation(session, observation_id)
	except ObservationNotFoundError as error:
		raise HTTPException(
			status_code=status.HTTP_404_NOT_FOUND,
			detail="Observation not found",
		) from error


@router.post(
	"",
	response_model=ObservationLogRead,
	status_code=status.HTTP_201_CREATED,
)
async def create_observation(
	payload: ObservationLogCreate,
	session: AsyncSession = Depends(get_db_session),
):
	"""Create an observation for an existing astronomical object."""
	try:
		return await controller.create_observation(session, payload)
	except controller.AstronomicalObjectNotFoundError as error:
		raise HTTPException(
			status_code=status.HTTP_404_NOT_FOUND,
			detail="Astronomical object not found",
		) from error


@router.put("/{observation_id}", response_model=ObservationLogRead)
async def replace_observation(
	observation_id: int,
	payload: ObservationLogCreate,
	session: AsyncSession = Depends(get_db_session),
):
	"""Replace an existing observation."""
	try:
		return await controller.replace_observation(
			session, observation_id, payload
		)
	except ObservationNotFoundError as error:
		raise HTTPException(
			status_code=status.HTTP_404_NOT_FOUND,
			detail="Observation not found",
		) from error
	except controller.AstronomicalObjectNotFoundError as error:
		raise HTTPException(
			status_code=status.HTTP_404_NOT_FOUND,
			detail="Astronomical object not found",
		) from error


@router.delete("/{observation_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_observation(
	observation_id: int,
	session: AsyncSession = Depends(get_db_session),
) -> None:
	"""Delete an observation."""
	try:
		await controller.delete_observation(session, observation_id)
	except ObservationNotFoundError as error:
		raise HTTPException(
			status_code=status.HTTP_404_NOT_FOUND,
			detail="Observation not found",
		) from error