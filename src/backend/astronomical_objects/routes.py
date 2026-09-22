from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from backend.api.dependencies import get_db_session
from backend.astronomical_objects import controller
from backend.astronomical_objects.schemas import (
	AstronomicalObjectCreate,
	AstronomicalObjectRead,
)
from backend.astronomical_objects.service import (
	AstronomicalObjectNotFoundError,
	DuplicateCatalogIdError,
)


router = APIRouter(prefix="/astronomical-objects", tags=["astronomical objects"])

# Routes translate HTTP requests and domain errors; controllers own the use cases.


@router.get("", response_model=list[AstronomicalObjectRead])
async def list_astronomical_objects(
	session: AsyncSession = Depends(get_db_session),
	object_type_id: int | None = Query(default=None, ge=1),
	skip: int = Query(default=0, ge=0),
	limit: int = Query(default=100, ge=1, le=100),
):
	"""Return a paginated list of astronomical objects."""
	return await controller.list_astronomical_objects(
		session, object_type_id, skip, limit
	)


@router.get("/{object_id}", response_model=AstronomicalObjectRead)
async def read_astronomical_object(
	object_id: int, session: AsyncSession = Depends(get_db_session)
):
	"""Return one astronomical object or an HTTP 404 response."""
	try:
		return await controller.get_astronomical_object(session, object_id)
	except AstronomicalObjectNotFoundError as error:
		raise HTTPException(
			status_code=status.HTTP_404_NOT_FOUND,
			detail="Astronomical object not found",
		) from error


@router.post(
	"",
	response_model=AstronomicalObjectRead,
	status_code=status.HTTP_201_CREATED,
)
async def create_astronomical_object(
	payload: AstronomicalObjectCreate,
	session: AsyncSession = Depends(get_db_session),
):
	"""Create an astronomical object and map domain errors to HTTP responses."""
	try:
		return await controller.create_astronomical_object(session, payload)
	except controller.ObjectTypeNotFoundError as error:
		raise HTTPException(
			status_code=status.HTTP_404_NOT_FOUND,
			detail="Object type not found",
		) from error
	except DuplicateCatalogIdError as error:
		raise HTTPException(
			status_code=status.HTTP_409_CONFLICT,
			detail="An astronomical object with this catalog_id already exists",
		) from error


@router.put("/{object_id}", response_model=AstronomicalObjectRead)
async def replace_astronomical_object(
	object_id: int,
	payload: AstronomicalObjectCreate,
	session: AsyncSession = Depends(get_db_session),
):
	"""Replace an existing astronomical object."""
	try:
		return await controller.replace_astronomical_object(
			session, object_id, payload
		)
	except AstronomicalObjectNotFoundError as error:
		raise HTTPException(
			status_code=status.HTTP_404_NOT_FOUND,
			detail="Astronomical object not found",
		) from error
	except controller.ObjectTypeNotFoundError as error:
		raise HTTPException(
			status_code=status.HTTP_404_NOT_FOUND,
			detail="Object type not found",
		) from error
	except DuplicateCatalogIdError as error:
		raise HTTPException(
			status_code=status.HTTP_409_CONFLICT,
			detail="An astronomical object with this catalog_id already exists",
		) from error


@router.delete("/{object_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_astronomical_object(
	object_id: int, session: AsyncSession = Depends(get_db_session)
):
	"""Delete an astronomical object and its related observations."""
	try:
		await controller.delete_astronomical_object(session, object_id)
	except AstronomicalObjectNotFoundError as error:
		raise HTTPException(
			status_code=status.HTTP_404_NOT_FOUND,
			detail="Astronomical object not found",
		) from error
