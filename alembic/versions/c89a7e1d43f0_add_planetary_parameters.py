"""add planetary parameters

Revision ID: c89a7e1d43f0
Revises: b6d3f8a2c941
Create Date: 2026-10-25

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "c89a7e1d43f0"
down_revision: Union[str, Sequence[str], None] = "b6d3f8a2c941"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "planetary_parameters",
        sa.Column("astronomical_object_id", sa.Integer(), nullable=False),
        sa.Column("mass_earth", sa.Numeric(precision=20, scale=8), nullable=True),
        sa.Column("radius_earth", sa.Numeric(precision=16, scale=8), nullable=True),
        sa.Column(
            "orbital_period_days",
            sa.Numeric(precision=20, scale=10),
            nullable=True,
        ),
        sa.Column(
            "semi_major_axis_au",
            sa.Numeric(precision=20, scale=12),
            nullable=True,
        ),
        sa.Column("eccentricity", sa.Numeric(precision=12, scale=10), nullable=True),
        sa.Column(
            "inclination_deg", sa.Numeric(precision=9, scale=6), nullable=True
        ),
        sa.Column(
            "equilibrium_temperature_k",
            sa.Numeric(precision=10, scale=3),
            nullable=True,
        ),
        sa.Column(
            "insolation_flux_earth",
            sa.Numeric(precision=20, scale=8),
            nullable=True,
        ),
        sa.CheckConstraint(
            "mass_earth IS NULL OR (mass_earth > 0 AND mass_earth < 'Infinity'::numeric)",
            name="ck_planetary_parameters_mass_earth_positive",
        ),
        sa.CheckConstraint(
            "radius_earth IS NULL OR (radius_earth > 0 AND radius_earth < 'Infinity'::numeric)",
            name="ck_planetary_parameters_radius_earth_positive",
        ),
        sa.CheckConstraint(
            "orbital_period_days IS NULL OR (orbital_period_days > 0 AND orbital_period_days < 'Infinity'::numeric)",
            name="ck_planetary_parameters_orbital_period_days_positive",
        ),
        sa.CheckConstraint(
            "semi_major_axis_au IS NULL OR (semi_major_axis_au > 0 AND semi_major_axis_au < 'Infinity'::numeric)",
            name="ck_planetary_parameters_semi_major_axis_au_positive",
        ),
        sa.CheckConstraint(
            "eccentricity IS NULL OR (eccentricity >= 0 AND eccentricity < 1)",
            name="ck_planetary_parameters_eccentricity_range",
        ),
        sa.CheckConstraint(
            "inclination_deg IS NULL OR (inclination_deg >= 0 AND inclination_deg <= 180)",
            name="ck_planetary_parameters_inclination_deg_range",
        ),
        sa.CheckConstraint(
            "equilibrium_temperature_k IS NULL OR (equilibrium_temperature_k >= 0 AND equilibrium_temperature_k < 'Infinity'::numeric)",
            name="ck_planetary_parameters_equilibrium_temperature_k_nonnegative",
        ),
        sa.CheckConstraint(
            "insolation_flux_earth IS NULL OR (insolation_flux_earth >= 0 AND insolation_flux_earth < 'Infinity'::numeric)",
            name="ck_planetary_parameters_insolation_flux_earth_nonnegative",
        ),
        sa.ForeignKeyConstraint(
            ["astronomical_object_id"],
            ["astronomical_objects.id"],
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("astronomical_object_id"),
    )


def downgrade() -> None:
    op.drop_table("planetary_parameters")
