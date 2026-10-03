from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
import ssl

from backend.core.config import settings

ssl_context = ssl.create_default_context()

engine = create_async_engine(
    settings.database_url,
    connect_args={"ssl": ssl_context},
    echo=True,
)

async_session_factory = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)