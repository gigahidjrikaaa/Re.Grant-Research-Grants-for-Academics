"""create initial tables

Revision ID: ba5b5ccbcfb6
Revises: cc44fc96a754
Create Date: 2025-05-15 10:46:12.360141

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'ba5b5ccbcfb6'
down_revision: Union[str, None] = 'cc44fc96a754'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
