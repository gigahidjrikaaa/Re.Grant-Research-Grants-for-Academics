from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base # For older SQLAlchemy, or use from sqlalchemy.orm
# from sqlalchemy.orm import declarative_base # For SQLAlchemy 1.4+

from app.core.config import settings

# Construct the DATABASE_URL (already in settings)
SQLALCHEMY_DATABASE_URL = settings.DATABASE_URL

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    # connect_args={"check_same_thread": False} # Only needed for SQLite, not PostgreSQL
    pool_pre_ping=True # Good practice to check connections before use
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base for declarative class definitions (SQLAlchemy models)
# For SQLAlchemy 1.3 and below, you might use:
# Base = declarative_base()
# For SQLAlchemy 1.4+ and 2.0, it's often imported directly from sqlalchemy.orm
# Or, you can define it in base_class.py as we planned