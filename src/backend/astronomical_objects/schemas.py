from decimal import Decimal

from pydantic import AwareDatetime, BaseModel, ConfigDict, Field

from backend.object_types.schemas import ObjectTypeRead


class PlanetaryParametersBase(BaseModel):
    model_config = ConfigDict(extra="forbid")

    mass_earth: Decimal | None = Field(
        default=None,
        gt=0,
        max_digits=20,
        decimal_places=8,
        allow_inf_nan=False,
        description="Mass in Earth masses; catalog values may represent mass or mass*sin(inclination).",
    )
    radius_earth: Decimal | None = Field(
        default=None,
        gt=0,
        max_digits=16,
        decimal_places=8,
        allow_inf_nan=False,
        description="Radius in Earth radii.",
    )
    orbital_period_days: Decimal | None = Field(
        default=None,
        gt=0,
        max_digits=20,
        decimal_places=10,
        allow_inf_nan=False,
        description="Orbital period in days.",
    )
    semi_major_axis_au: Decimal | None = Field(
        default=None,
        gt=0,
        max_digits=20,
        decimal_places=12,
        allow_inf_nan=False,
        description="Semi-major axis in astronomical units (AU).",
    )
    eccentricity: Decimal | None = Field(
        default=None,
        ge=0,
        lt=1,
        max_digits=12,
        decimal_places=10,
        allow_inf_nan=False,
        description="Dimensionless orbital eccentricity in [0, 1).",
    )
    inclination_deg: Decimal | None = Field(
        default=None,
        ge=0,
        le=180,
        max_digits=9,
        decimal_places=6,
        allow_inf_nan=False,
        description="Orbital inclination in degrees, in [0, 180].",
    )
    equilibrium_temperature_k: Decimal | None = Field(
        default=None,
        ge=0,
        max_digits=10,
        decimal_places=3,
        allow_inf_nan=False,
        description="Equilibrium temperature in kelvin (K).",
    )
    insolation_flux_earth: Decimal | None = Field(
        default=None,
        ge=0,
        max_digits=20,
        decimal_places=8,
        allow_inf_nan=False,
        description="Insolation flux in Earth units.",
    )


class PlanetaryParametersCreate(PlanetaryParametersBase):
    pass


class PlanetaryParametersRead(PlanetaryParametersBase):
    model_config = ConfigDict(from_attributes=True)


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
    # Optional planet-specific measurements; omitted/null on PUT clears the record.
    planetary_parameters: PlanetaryParametersCreate | None = None


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
    planetary_parameters: PlanetaryParametersRead | None