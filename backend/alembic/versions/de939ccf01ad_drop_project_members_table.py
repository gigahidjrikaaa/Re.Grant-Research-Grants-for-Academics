"""drop_project_members_table

Revision ID: de939ccf01ad
Revises: 448cf8399aa1
Create Date: 2025-05-17 09:48:56.152602

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'de939ccf01ad'
down_revision: Union[str, None] = '448cf8399aa1'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Drop the project_members table
    # Adding if_exists=True makes it safer if run multiple times or if table is already gone
    op.drop_table('project_members', if_exists=True)


def downgrade() -> None:
    """Downgrade schema."""
    # Re-create the project_members table with its presumed original schema
    # You'll need to adjust the columns and constraints to match the original table definition.
    # This is an example schema; replace it with the actual original schema.
    bind = op.get_bind()
    if not bind.dialect.has_table(bind, 'project_members'):
        op.create_table('project_members',
            sa.Column('id', sa.Integer(), nullable=False),
            sa.Column('project_id', sa.Integer(), nullable=False),
            sa.Column('user_id', sa.Integer(), nullable=False),
            sa.Column('role_in_project', sa.String(length=100), nullable=False), # Adjust length as needed
            # Assuming created_at and updated_at might have existed
            sa.Column('created_at', sa.DateTime(), server_default=sa.func.now(), nullable=False),
            sa.Column('updated_at', sa.DateTime(), server_default=sa.func.now(), onupdate=sa.func.now(), nullable=False),
            
            sa.ForeignKeyConstraint(['project_id'], ['projects.id'], name='fk_project_members_project_id', ondelete='CASCADE'),
            sa.ForeignKeyConstraint(['user_id'], ['users.id'], name='fk_project_members_user_id', ondelete='CASCADE'),
            sa.PrimaryKeyConstraint('id')
        )
        # Re-create any indexes that might have existed
        op.create_index(op.f('ix_project_members_id'), 'project_members', ['id'], unique=False)
        op.create_index(op.f('ix_project_members_project_id'), 'project_members', ['project_id'], unique=False)
        op.create_index(op.f('ix_project_members_user_id'), 'project_members', ['user_id'], unique=False)
    else:
        print("Table 'project_members' already exists. Skipping re-creation in downgrade.")
