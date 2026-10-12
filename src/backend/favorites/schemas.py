from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from backend.astronomical_objects.schemas import AstronomicalObjectRead


class FavoriteCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    astronomical_object_id: int = Field(gt=0)


class FavoriteRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    astronomical_object: AstronomicalObjectRead
