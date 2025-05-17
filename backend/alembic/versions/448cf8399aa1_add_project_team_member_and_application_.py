"""add_project_team_member_and_application_models

Revision ID: 448cf8399aa1
Revises: 42abacb5cd59
Create Date: 2025-05-17 09:12:41.013190

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
# Assuming ProjectApplicationStatus is correctly defined in your models
# If app.models directly imports db.base_class which defines Base,
# it might be better to define enums used in migrations more directly
# or ensure app.models can be imported without initializing the full app.
# For simplicity, if ProjectApplicationStatus is a simple Python enum:
import enum

class ProjectApplicationStatus(str, enum.Enum): # Re-define or import carefully
    DRAFT = "draft"
    SUBMITTED = "submitted"
    IN_REVIEW = "in_review"
    INTERVIEW_SCHEDULED = "interview_scheduled"
    ACCEPTED = "accepted"
    REJECTED = "rejected"
    CLOSED = "closed"

application_status_enum_type = postgresql.ENUM(
    ProjectApplicationStatus,
    name='applicationstatus',
    create_type=False # Will not attempt to CREATE TYPE if it exists
)

# revision identifiers, used by Alembic.
revision: str = '448cf8399aa1'
down_revision: Union[str, None] = '42abacb5cd59'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()

    # Check and create project_team_members table
    if not bind.dialect.has_table(bind, 'project_team_members'):
        op.create_table('project_team_members',
            sa.Column('id', sa.Integer(), nullable=False),
            sa.Column('project_id', sa.Integer(), nullable=False),
            sa.Column('user_id', sa.Integer(), nullable=False),
            sa.Column('role_in_project', sa.String(), nullable=False),
            sa.ForeignKeyConstraint(['project_id'], ['projects.id'], ondelete='CASCADE'),
            sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
            sa.PrimaryKeyConstraint('id')
        )
        op.create_index(op.f('ix_project_team_members_id'), 'project_team_members', ['id'], unique=False)
        op.create_index(op.f('ix_project_team_members_project_id'), 'project_team_members', ['project_id'], unique=False)
        op.create_index(op.f('ix_project_team_members_user_id'), 'project_team_members', ['user_id'], unique=False)
    else:
        print("Table 'project_team_members' already exists. Skipping creation.")

    # Check and create project_applications table
    if not bind.dialect.has_table(bind, 'project_applications'):
        # Ensure the enum type exists before creating the table that uses it.
        # This is important if this migration is the one responsible for the enum.
        # If a previous migration created it, this check might be redundant.
        # The postgresql.ENUM with create_type=False handles not re-creating the type.
        # However, if the type was never created, this migration would fail unless create_type=True
        # or an explicit op.execute("CREATE TYPE IF NOT EXISTS ...") is used.
        # For now, we assume the type 'applicationstatus' should exist or be handled by the ENUM definition.
        
        # If the enum type itself might not exist, you'd ensure its creation first:
        # application_status_enum_type.create(bind=bind, checkfirst=True)
        # This line above would attempt to create the ENUM 'applicationstatus' if it doesn't exist.
        # Given the previous error was "type already exists", it's safer to assume it does.

        op.create_table('project_applications',
            sa.Column('id', sa.Integer(), nullable=False),
            sa.Column('project_id', sa.Integer(), nullable=False),
            sa.Column('user_id', sa.Integer(), nullable=False),
            sa.Column('cover_letter', sa.Text(), nullable=True),
            sa.Column('status', application_status_enum_type, nullable=False, server_default=ProjectApplicationStatus.DRAFT.value),
            sa.Column('application_date', sa.Date(), nullable=False),
            sa.ForeignKeyConstraint(['project_id'], ['projects.id'], ondelete='CASCADE'),
            sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
            sa.PrimaryKeyConstraint('id')
        )
        op.create_index(op.f('ix_project_applications_id'), 'project_applications', ['id'], unique=False)
        op.create_index(op.f('ix_project_applications_project_id'), 'project_applications', ['project_id'], unique=False)
        op.create_index(op.f('ix_project_applications_user_id'), 'project_applications', ['user_id'], unique=False)
    else:
        print("Table 'project_applications' already exists. Skipping creation.")


def downgrade() -> None:
    bind = op.get_bind()

    # Downgrade for project_applications
    if bind.dialect.has_table(bind, 'project_applications'):
        op.drop_index(op.f('ix_project_applications_user_id'), table_name='project_applications')
        op.drop_index(op.f('ix_project_applications_project_id'), table_name='project_applications')
        op.drop_index(op.f('ix_project_applications_id'), table_name='project_applications')
        op.drop_table('project_applications')
    else:
        print("Table 'project_applications' does not exist. Skipping drop.")

    # Downgrade for project_team_members
    if bind.dialect.has_table(bind, 'project_team_members'):
        op.drop_index(op.f('ix_project_team_members_user_id'), table_name='project_team_members')
        op.drop_index(op.f('ix_project_team_members_project_id'), table_name='project_team_members')
        op.drop_index(op.f('ix_project_team_members_id'), table_name='project_team_members')
        op.drop_table('project_team_members')
    else:
        print("Table 'project_team_members' does not exist. Skipping drop.")

    # Downgrade for the enum type:
    # Only drop if this migration was solely responsible for its creation and it's not shared.
    # It's generally safer to leave shared enum types unless you are certain.
    # If you need to drop it:
    # if bind.dialect.has_type(bind, 'applicationstatus', schema=None): # has_type might not be standard
    #    application_status_enum_type.drop(op.get_bind(), checkfirst=True)
    # else:
    #    print("Enum type 'applicationstatus' does not exist. Skipping drop.")
    pass # Be cautious with dropping shared enum types in downgrade.