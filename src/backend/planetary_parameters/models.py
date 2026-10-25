from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import CheckConstraint, ForeignKey, Numeric
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.database.base import Base

if TYPE_CHECKING:
    from backend.astronomical_objects.models import AstronomicalObject


class PlanetaryParameters(Base):
    __tablename__ = "planetary_parameters"
    __table_args__ = (
        CheckConstraint(
            "mass_earth IS NULL OR (mass_earth > 0 AND mass_earth < 'Infinity'::numeric)",
            name="ck_planetary_parameters_mass_earth_positive",
        ),
        CheckConstraint(
            "radius_earth IS NULL OR (radius_earth > 0 AND radius_earth < 'Infinity'::numeric)",
            name="ck_planetary_parameters_radius_earth_positive",
        ),
        CheckConstraint(
            "orbital_period_days IS NULL OR (orbital_period_days > 0 AND orbital_period_days < 'Infinity'::numeric)",
            name="ck_planetary_parameters_orbital_period_days_positive",
        ),
        CheckConstraint(
            "semi_major_axis_au IS NULL OR (semi_major_axis_au > 0 AND semi_major_axis_au < 'Infinity'::numeric)",
            name="ck_planetary_parameters_semi_major_axis_au_positive",
        ),
        CheckConstraint(
            "eccentricity IS NULL OR (eccentricity >= 0 AND eccentricity < 1)",
            name="ck_planetary_parameters_eccentricity_range",
        ),
        CheckConstraint(
            "inclination_deg IS NULL OR (inclination_deg >= 0 AND inclination_deg <= 180)",
            name="ck_planetary_parameters_inclination_deg_range",
        ),
        CheckConstraint(
            "equilibrium_temperature_k IS NULL OR (equilibrium_temperature_k >= 0 AND equilibrium_temperature_k < 'Infinity'::numeric)",
            name="ck_planetary_parameters_equilibrium_temperature_k_nonnegative",
        ),
        CheckConstraint(
            "insolation_flux_earth IS NULL OR (insolation_flux_earth >= 0 AND insolation_flux_earth < 'Infinity'::numeric)",
            name="ck_planetary_parameters_insolation_flux_earth_nonnegative",
        ),
    )

    astronomical_object_id: Mapped[int] = mapped_column(
        ForeignKey("astronomical_objects.id", ondelete="CASCADE"),
        primary_key=True,
    )
    mass_earth: Mapped[Decimal | None] = mapped_column(
        Numeric(20, 8), nullable=True
    )
    radius_earth: Mapped[Decimal | None] = mapped_column(
        Numeric(16, 8), nullable=True
    )
    orbital_period_days: Mapped[Decimal | None] = mapped_column(
        Numeric(20, 10), nullable=True
    )
    semi_major_axis_au: Mapped[Decimal | None] = mapped_column(
        Numeric(20, 12), nullable=True
    )
    eccentricity: Mapped[Decimal | None] = mapped_column(
        Numeric(12, 10), nullable=True
    )
    inclination_deg: Mapped[Decimal | None] = mapped_column(
        Numeric(9, 6), nullable=True
    )
    equilibrium_temperature_k: Mapped[Decimal | None] = mapped_column(
        Numeric(10, 3), nullable=True
    )
    insolation_flux_earth: Mapped[Decimal | None] = mapped_column(
        Numeric(20, 8), nullable=True
    )

    astronomical_object: Mapped["AstronomicalObject"] = relationship(
        back_populates="planetary_parameters"
    )
