"""feedback created_at and unique per user per idea

Revision ID: 005
Revises: 004
Create Date: 2026-05-16

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "005"
down_revision: Union[str, None] = "004"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "feedbacks",
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
    )
    op.execute(
        """
        DELETE FROM feedbacks f1
        USING feedbacks f2
        WHERE f1.id > f2.id
          AND f1.user_id = f2.user_id
          AND f1.idea_id = f2.idea_id
        """
    )
    op.create_unique_constraint("uq_feedback_user_idea", "feedbacks", ["user_id", "idea_id"])


def downgrade() -> None:
    op.drop_constraint("uq_feedback_user_idea", "feedbacks", type_="unique")
    op.drop_column("feedbacks", "created_at")
