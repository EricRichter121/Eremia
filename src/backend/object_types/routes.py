from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from backend.api.dependencies import get_db_session
from backend.object_types import controller
from backend.object_types.schemas import ObjectTypeCreate, ObjectTypeRead
from backend.object_types.service import (
	DuplicateObjectTypeNameError,
	ObjectTypeNotFoundError,
)


router = APIRouter(prefix="/object-types", tags=["object types"])


@router.get("", response_model=list[ObjectTypeRead])
async def list_object_types(
	session: AsyncSession = Depends(get_db_session),
):
	"""Return all object types ordered by name."""
	return await controller.list_object_types(session)


@router.get("/{object_type_id}", response_model=ObjectTypeRead)
async def read_object_type(
	object_type_id: int,
	session: AsyncSession = Depends(get_db_session),
):
	"""Return one object type or a 404 response."""
	try:
		return await controller.get_object_type(session, object_type_id)
	except ObjectTypeNotFoundError as error:
		raise HTTPException(
			status_code=status.HTTP_404_NOT_FOUND,
			detail="Object type not found",
		) from error


@router.post(
	"",
	response_model=ObjectTypeRead,
	status_code=status.HTTP_201_CREATED,
)
async def create_object_type(
	payload: ObjectTypeCreate,
	session: AsyncSession = Depends(get_db_session),
):
	"""Create an object type."""
	try:
		return await controller.create_object_type(session, payload)
	except DuplicateObjectTypeNameError as error:
		raise HTTPException(
			status_code=status.HTTP_409_CONFLICT,
			detail="An object type with this name already exists",
		) from error


@router.put("/{object_type_id}", response_model=ObjectTypeRead)
async def replace_object_type(
	object_type_id: int,
	payload: ObjectTypeCreate,
	session: AsyncSession = Depends(get_db_session),
):
	"""Replace an existing object type."""
	try:
		return await controller.replace_object_type(
			session, object_type_id, payload
		)
	except ObjectTypeNotFoundError as error:
		raise HTTPException(
			status_code=status.HTTP_404_NOT_FOUND,
			detail="Object type not found",
		) from error
	except DuplicateObjectTypeNameError as error:
		raise HTTPException(
			status_code=status.HTTP_409_CONFLICT,
			detail="An object type with this name already exists",
		) from error


@router.delete("/{object_type_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_object_type(
	object_type_id: int,
	session: AsyncSession = Depends(get_db_session),
) -> None:
	"""Delete an object type."""
	try:
		await controller.delete_object_type(session, object_type_id)
	except ObjectTypeNotFoundError as error:
		raise HTTPException(
			status_code=status.HTTP_404_NOT_FOUND,
			detail="Object type not found",
		) from error