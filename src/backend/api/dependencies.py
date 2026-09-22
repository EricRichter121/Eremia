from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession

from backend.database.db import async_session_factory


async def get_db_session() -> AsyncGenerator[AsyncSession, None]:
	"""Provide one database session for the lifetime of a request."""
	async with async_session_factory() as session:
		yield session