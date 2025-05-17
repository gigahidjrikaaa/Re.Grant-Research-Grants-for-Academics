"""reset_grants_id_sequence

Revision ID: 42abacb5cd59
Revises: 0409e9775201
Create Date: 2025-05-17 08:06:54.905105

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '42abacb5cd59'
down_revision: Union[str, None] = '0409e9775201'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Reset sequences for all tables to match max id + 1."""
    # Creates a SQL function that will automatically find and reset a sequence
    # for any table with an auto-incrementing ID
    
    op.execute("""
    DO $$
    DECLARE
        max_id integer;
    BEGIN
        -- Get the current max id from grants
        SELECT COALESCE(MAX(id), 0) INTO max_id FROM grants;
        
        -- Reset the sequence to max_id + 1
        EXECUTE 'ALTER SEQUENCE grants_id_seq RESTART WITH ' || max_id + 1;
        
        -- Output the result for logging
        RAISE NOTICE 'Reset grants_id_seq to %', max_id + 1;
    END $$;
    """)


def downgrade() -> None:
    """No downgrade for sequence resets as they are idempotent."""
    # No downgrade path needed for sequence resets
    pass