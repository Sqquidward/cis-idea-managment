"""project plans table

Revision ID: 002
Revises: 001
Create Date: 2026-05-16

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "002"
down_revision: Union[str, None] = "001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "project_plans",
        sa.Column("idea_id", sa.Integer(), nullable=False),
        sa.Column("deadline", sa.String(length=10), nullable=False),
        sa.Column("tasks", sa.JSON(), nullable=False),
        sa.ForeignKeyConstraint(["idea_id"], ["ideas.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("idea_id"),
    )


def downgrade() -> None:
    op.drop_table("project_plans")
