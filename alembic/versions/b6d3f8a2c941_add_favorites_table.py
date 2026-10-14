"""add favorites table

Revision ID: b6d3f8a2c941
Revises: 7f3c2a9d1b64
Create Date: 2026-10-12

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "b6d3f8a2c941"
down_revision: Union[str, Sequence[str], None] = "7f3c2a9d1b64"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "favorites",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("astronomical_object_id", sa.Integer(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(
            ["astronomical_object_id"],
            ["astronomical_objects.id"],
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint(
            "user_id",
            "astronomical_object_id",
            name="uq_favorites_user_id_astronomical_object_id",
        ),
    )
    op.create_index(
        op.f("ix_favorites_astronomical_object_id"),
        "favorites",
        ["astronomical_object_id"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index(
        op.f("ix_favorites_astronomical_object_id"), table_name="favorites"
    )
    op.drop_table("favorites")
