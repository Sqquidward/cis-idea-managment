"""plan team members

Revision ID: 003
Revises: 002
Create Date: 2026-05-16

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "003"
down_revision: Union[str, None] = "002"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("project_plans", sa.Column("team_members", sa.JSON(), nullable=True))
    op.execute(
        """
        UPDATE project_plans
        SET team_members = '[]'::json
        WHERE team_members IS NULL
        """
    )
    op.alter_column("project_plans", "team_members", nullable=False)


def downgrade() -> None:
    op.drop_column("project_plans", "team_members")
