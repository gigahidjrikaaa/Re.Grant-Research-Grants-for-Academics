"""synchronize_data_models_and_enums

Revision ID: 76893dfcc7f2
Revises: d7784e03f8cd
Create Date: 2025-05-17 01:02:39.215247

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
from app.core.security import get_password_hash # For generating a default password (if needed)

# Placeholder if you decide to make password non-nullable and need a default
# DEFAULT_PLACEHOLDER_PASSWORD = "loremipsumdolorsitametconsecteturadipiscingelit" 

# Define your enum values here, matching your Python enum
grant_application_status_enum = postgresql.ENUM(
    'SUBMITTED', 'UNDER_REVIEW', 'ACCEPTED', 'REJECTED', 'WITHDRAWN', 
    name='grantapplicationstatus', create_type=False
)

grant_type_enum = postgresql.ENUM(
    'RESEARCH', 'FELLOWSHIP', 'TRAVEL', 'EQUIPMENT', 'SEED_FUNDING', 'OTHER',
    name='granttype', create_type=False
)

project_category_enum = postgresql.ENUM(
    'TECHNOLOGY', 'SCIENCE', 'ARTS', 'SOCIAL_SCIENCES', 'HEALTH', 'EDUCATION', 'ENVIRONMENT', 'OTHER',
    name='projectcategory', create_type=False
)

# revision identifiers, used by Alembic.
revision: str = '76893dfcc7f2'
down_revision: Union[str, None] = 'd7784e03f8cd'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    grant_application_status_enum.create(op.get_bind(), checkfirst=True)
    grant_type_enum.create(op.get_bind(), checkfirst=True)
    project_category_enum.create(op.get_bind(), checkfirst=True)

    op.alter_column('grant_applications', 'status',
               existing_type=sa.VARCHAR(),
               type_=grant_application_status_enum,
               existing_nullable=False,
               postgresql_using='status::grantapplicationstatus')

    op.add_column('grants', sa.Column('grant_type', grant_type_enum, nullable=True))
    op.add_column('grants', sa.Column('application_start_date', sa.DateTime(timezone=True), nullable=True))
    op.add_column('grants', sa.Column('eligibility_criteria', sa.Text(), nullable=True))
    op.add_column('grants', sa.Column('website_link', sa.String(), nullable=True))
    
    op.drop_column('project_members', 'application_status')
    op.drop_column('project_members', 'is_applicant')
    
    op.add_column('projects', sa.Column('category', project_category_enum, nullable=True))
    op.add_column('projects', sa.Column('budget', sa.Numeric(precision=18, scale=2), nullable=True))
    
    # Add hashed_password as nullable, as per your potential model definition
    op.add_column('users', sa.Column('hashed_password', sa.String(), nullable=True)) 
    # If hashed_password was intended to be NOT NULL, you would follow the 3-step process:
    # 1. Add as nullable=True
    # 2. Update existing NULLs with a default hashed password
    #    default_hashed_password_value = get_password_hash(DEFAULT_PLACEHOLDER_PASSWORD)
    #    op.execute(
    #        sa.text("UPDATE users SET hashed_password = :default_password WHERE hashed_password IS NULL")
    #        .bindparams(default_password=default_hashed_password_value)
    #    )
    # 3. Alter to nullable=False
    #    op.alter_column('users', 'hashed_password', nullable=False)

    # Ensure wallet_address is NOT NULL
    # If wallet_address might have existing NULLs and is being changed to NOT NULL:
    # Step 1: (If column is new or type is changing, add/alter it first, possibly as nullable)
    # op.alter_column('users', 'wallet_address', existing_type=sa.VARCHAR(), type_=sa.String(42), nullable=True) # Example if type changes
    
    # Step 2: Update existing NULL wallet_addresses with a placeholder or handle them
    # This is critical if there are existing users without wallet_addresses.
    # You MUST provide a default or handle these rows. For example:
    op.execute(
        sa.text("UPDATE users SET wallet_address = 'NEEDS_UPDATE_' || id::text WHERE wallet_address IS NULL")
    ) # This creates unique placeholders like 'NEEDS_UPDATE_1'

    # Step 3: Now alter wallet_address to be NOT NULL
    op.alter_column('users', 'wallet_address',
               existing_type=sa.VARCHAR(), # Or sa.String() if it was already String
               type_=sa.String(42), # Ensure type is correct if it changed
               nullable=False)

    # Ensure email is NULLABLE
    op.alter_column('users', 'email',
               existing_type=sa.VARCHAR(), # Or sa.String()
               nullable=True)


def downgrade() -> None:
    """Downgrade schema."""
    op.alter_column('users', 'email',
               existing_type=sa.String(), # Assuming it becomes String
               nullable=False) # Revert to what it was before this migration (e.g., NOT NULL if it was)
               
    op.alter_column('users', 'wallet_address',
               existing_type=sa.String(42), 
               nullable=True) # Revert to nullable if it was, or its original state
               
    op.drop_column('users', 'hashed_password')
    
    op.drop_column('projects', 'budget')
    op.drop_column('projects', 'category')
    
    op.add_column('project_members', sa.Column('is_applicant', sa.BOOLEAN(), autoincrement=False, nullable=True))
    op.add_column('project_members', sa.Column('application_status', sa.VARCHAR(), autoincrement=False, nullable=True))
    
    op.drop_column('grants', 'website_link')
    op.drop_column('grants', 'eligibility_criteria')
    op.drop_column('grants', 'application_start_date')
    op.drop_column('grants', 'grant_type')
    
    op.alter_column('grant_applications', 'status',
               existing_type=grant_application_status_enum,
               type_=sa.VARCHAR(),
               existing_nullable=False)
               
    grant_application_status_enum.drop(op.get_bind(), checkfirst=True)
    grant_type_enum.drop(op.get_bind(), checkfirst=True)
    project_category_enum.drop(op.get_bind(), checkfirst=True)