"""add_project_application_table

Revision ID: a33991c30cc3
Revises: 3539dfef77cb
Create Date: 2025-05-17 00:43:03.633741

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a33991c30cc3'
down_revision: Union[str, None] = '3539dfef77cb'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
