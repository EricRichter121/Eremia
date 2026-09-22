from typing import TYPE_CHECKING

from sqlalchemy import String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.database.base import Base

if TYPE_CHECKING:
    from backend.astronomical_objects.models import AstronomicalObject


class ObjectType(Base):
    # Tell SQLAlchemy which database table this Python class represents.
    __tablename__ = "object_types"

    # The primary key uniquely identifies each object type.
    id: Mapped[int] = mapped_column(primary_key=True)
    # Each type has a unique name, and the index makes type lookups faster.
    name: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    # Store optional details about the type, such as its usual characteristics.
    description: Mapped[str | None] = mapped_column(Text)

    # One type can be assigned to many astronomical objects.
    # back_populates connects this relationship to the object_type field
    # on the AstronomicalObject model.
    astronomical_objects: Mapped[list["AstronomicalObject"]] = relationship(
        back_populates="object_type"
    )