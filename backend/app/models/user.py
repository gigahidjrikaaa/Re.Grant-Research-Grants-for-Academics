from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum as DBEnum
from sqlalchemy.sql import func # For default timestamps
from sqlalchemy.orm import relationship

from app.db.base_class import Base
import enum

class UserRole(str, enum.Enum):
    STUDENT = "student"
    RESEARCHER = "researcher"
    ADMIN = "admin"

class User(Base):
    __tablename__ = "users" # Explicitly defining, though Base can auto-generate

    id = Column(Integer, primary_key=True, index=True)
    wallet_address = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=True) # Email might be optional initially
    full_name = Column(String, index=True, nullable=True)
    role = Column(DBEnum(UserRole), default=UserRole.STUDENT, nullable=False)
    
    # Hashed password, if you decide to implement traditional password auth alongside/fallback for wallet
    # hashed_password = Column(String, nullable=True)
    
    is_active = Column(Boolean(), default=True)
    is_superuser = Column(Boolean(), default=False) # For admin roles

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships (add later as needed)
    # grants_proposed = relationship("Grant", back_populates="proposer") # If user proposes grants
    # profile = relationship("Profile", back_populates="user", uselist=False) # One-to-one with Profile

    def __repr__(self):
        return f"<User(id={self.id}, wallet_address='{self.wallet_address}', role='{self.role.value}')>"