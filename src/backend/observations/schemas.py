from decimal import Decimal

from pydantic import AwareDatetime, BaseModel, ConfigDict, Field


class ObservationLogBase(BaseModel):
    astronomical_object_id: int = Field(gt=0)
    observed_at: AwareDatetime
    observatory: str | None = None
    magnitude: Decimal | None = Field(default=None, max_digits=10, decimal_places=4)
    distance_au: Decimal | None = Field(default=None, max_digits=16, decimal_places=6)
    notes: str | None = None


class ObservationLogCreate(ObservationLogBase):
    pass


class ObservationLogRead(ObservationLogBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
