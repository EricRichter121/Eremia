from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
import ssl

from backend.core.config import settings

# Use the platform trust store to verify the database server's TLS certificate.
ssl_context = ssl.create_default_context()

engine = create_async_engine(
    settings.database_url,
    connect_args={"ssl": ssl_context},
    echo=False,
)

async_session_factory = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)