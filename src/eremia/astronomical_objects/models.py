from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from eremia.database.base import Base

if TYPE_CHECKING:
    from eremia.observations.models import ObservationLog
    from eremia.object_types.models import ObjectType


class AstronomicalObject(Base):
    # Tell SQLAlchemy which database table this Python class represents.
    __tablename__ = "astronomical_objects"

    # The primary key uniquely identifies each astronomical object.
    id: Mapped[int] = mapped_column(primary_key=True)
    # Indexing the name makes searches and sorting by name more efficient.
    name: Mapped[str] = mapped_column(String(150), index=True)
    # A catalog identifier is optional, but must be unique when provided.
    catalog_id: Mapped[str | None] = mapped_column(String(100), unique=True)
    # Store the related object type, such as planet, asteroid, or satellite.
    object_type_id: Mapped[int] = mapped_column(
        ForeignKey("object_types.id", ondelete="RESTRICT"), index=True
    )
    # Optional descriptive information about the object.
    description: Mapped[str | None] = mapped_column(Text)
    # The discovery date may be unknown, so this column accepts NULL values.
    discovered_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    # The database sets this timestamp when the row is first inserted.
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    # Many astronomical objects can share one object type.
    object_type: Mapped["ObjectType"] = relationship(
        back_populates="astronomical_objects"
    )
    # One astronomical object can have many observation records.
    # Deleting the object also deletes its observations.
    observations: Mapped[list["ObservationLog"]] = relationship(
        back_populates="astronomical_object", cascade="all, delete-orphan"
    )