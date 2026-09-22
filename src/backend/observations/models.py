from datetime import datetime
from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, Numeric, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.database.base import Base

if TYPE_CHECKING:
    from backend.astronomical_objects.models import AstronomicalObject


class ObservationLog(Base):
    # Tell SQLAlchemy which database table stores observation records.
    __tablename__ = "observation_logs"

    # The primary key uniquely identifies each observation.
    id: Mapped[int] = mapped_column(primary_key=True)
    # Link this observation to the astronomical object that was observed.
    # The index makes it faster to find all observations for one object.
    astronomical_object_id: Mapped[int] = mapped_column(
        ForeignKey("astronomical_objects.id", ondelete="CASCADE"), index=True
    )
    # Record when the observation actually took place.
    observed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    # The observatory or observing facility is optional.
    observatory: Mapped[str | None] = mapped_column(Text)
    # Apparent brightness, stored with up to four decimal places.
    magnitude: Mapped[Decimal | None] = mapped_column(Numeric(10, 4))
    # Distance from Earth in astronomical units, stored with six decimals.
    distance_au: Mapped[Decimal | None] = mapped_column(Numeric(16, 6))
    # Free-form notes about the observation.
    notes: Mapped[str | None] = mapped_column(Text)
    # The database sets this timestamp when the observation row is inserted.
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    # Give Python code access to the related astronomical object.
    # back_populates connects this field to AstronomicalObject.observations.
    astronomical_object: Mapped["AstronomicalObject"] = relationship(
        back_populates="observations"
    )
