from pydantic import BaseModel, ConfigDict, Field


class ObjectTypeBase(BaseModel):
    name: str = Field(min_length=1, max_length=50)
    description: str | None = None


class ObjectTypeCreate(ObjectTypeBase):
    pass


class ObjectTypeRead(ObjectTypeBase):
    model_config = ConfigDict(from_attributes=True)

    id: int