from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.database.base import Base

if TYPE_CHECKING:
    from backend.astronomical_objects.models import AstronomicalObject
    from backend.users.models import User


class Favorite(Base):
    __tablename__ = "favorites"
    __table_args__ = (
        UniqueConstraint(
            "user_id",
            "astronomical_object_id",
            name="uq_favorites_user_id_astronomical_object_id",
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    astronomical_object_id: Mapped[int] = mapped_column(
        ForeignKey("astronomical_objects.id", ondelete="CASCADE"), index=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    user: Mapped["User"] = relationship(back_populates="favorites")
    astronomical_object: Mapped["AstronomicalObject"] = relationship(
        back_populates="favorites"
    )
