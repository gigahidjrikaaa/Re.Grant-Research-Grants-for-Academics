"""add_user_role_enum_and_column_types

Revision ID: 0409e9775201
Revises: 76893dfcc7f2
Create Date: 2025-05-17 01:45:53.481690

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = '0409e9775201'
down_revision: Union[str, None] = '76893dfcc7f2'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

# Define UserRole enum object for column type definition (create_type=False)
user_role_column_type = postgresql.ENUM(
    'student', 'researcher', 'admin', 'institution',
    name='userrole', create_type=False 
)

def upgrade() -> None:
    """Upgrade schema."""
    conn = op.get_bind()

    # Step 1: Ensure the ENUM type exists with all necessary values.
    enum_exists = conn.execute(
        sa.text("SELECT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'userrole' AND typtype = 'e')")
    ).scalar_one()

    if not enum_exists:
        # If the enum doesn't exist at all, create it with all values.
        # Use a temporary enum object with create_type=True for initial creation.
        temp_enum_for_creation = postgresql.ENUM(
            'student', 'researcher', 'admin', 'institution',
            name='userrole', create_type=True
        )
        temp_enum_for_creation.create(conn, checkfirst=False) # checkfirst=False as we've already checked
    else:
        # If it exists, add missing values.
        # These commands are transactional.
        op.execute("ALTER TYPE userrole ADD VALUE IF NOT EXISTS 'student'")
        op.execute("ALTER TYPE userrole ADD VALUE IF NOT EXISTS 'researcher'")
        op.execute("ALTER TYPE userrole ADD VALUE IF NOT EXISTS 'admin'")
        op.execute("ALTER TYPE userrole ADD VALUE IF NOT EXISTS 'institution'")
        
    # Step 2: Alter the 'users.role' column to use this enum.
    # DO NOT set server_default here.
    op.alter_column('users', 'role',
               existing_type=sa.VARCHAR(), 
               type_=user_role_column_type,
               nullable=False, # As per your model
               postgresql_using='role::text::userrole')
               # server_default will be set in a subsequent migration

def downgrade() -> None:
    """Downgrade schema."""
    # The server_default will be handled by the downgrade of the *next* migration.
    # Here, we only revert the type change.
    op.alter_column('users', 'role',
               existing_type=user_role_column_type,
               type_=sa.VARCHAR(length=50), # Or whatever it was before
               existing_nullable=False)

    # Downgrading enum values (e.g., removing 'institution') or dropping the enum type
    # is complex and context-dependent. For simplicity, we are not doing that here.
    # If this migration created the enum from scratch, and no other migration added to it,
    # then you might consider dropping it:
    # conn = op.get_bind()
    # enum_exists_for_drop_check = conn.execute(
    #     sa.text("SELECT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'userrole' AND typtype = 'e')")
    # ).scalar_one()
    # if enum_exists_for_drop_check:
    #     # Only drop if this migration was the sole creator and no data depends on it.
    #     # This is a simplification; real-world might need more checks.
    #     # user_role_column_type.drop(conn, checkfirst=True) # Be cautious
    pass