"""create initial tables

Revision ID: cc44fc96a754
Revises: fdf846d0d53a
Create Date: 2025-05-15 01:03:07.739715

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'cc44fc96a754'
down_revision: Union[str, None] = 'fdf846d0d53a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
