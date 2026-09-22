from pydantic import AwareDatetime, BaseModel, ConfigDict, Field

from backend.object_types.schemas import ObjectTypeRead


# Shared fields for astronomical object payloads used in create/update flows.
class AstronomicalObjectBase(BaseModel):
    # Human-readable name of the celestial object.
    name: str = Field(min_length=1, max_length=150)
    # Optional catalog identifier, such as a known astronomical designation.
    catalog_id: str | None = Field(default=None, max_length=100)
    # Identifier of the object type, e.g. star, planet, galaxy, etc.
    object_type_id: int = Field(gt=0)
    # Optional summary or description of the object.
    description: str | None = None
    # Date when the object was discovered, if known.
    discovered_at: AwareDatetime | None = None


# Payload for creating a new astronomical object. It reuses the base fields.
class AstronomicalObjectCreate(AstronomicalObjectBase):
    pass


# Response model for reading an astronomical object from the database.
class AstronomicalObjectRead(AstronomicalObjectBase):
    # Allow creation from ORM model attributes when returning database rows.
    model_config = ConfigDict(from_attributes=True)

    # Database primary key and creation timestamp.
    id: int
    # created_at: datetime
    # Nested object type information included in API responses.
    object_type: ObjectTypeRead