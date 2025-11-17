"""
Database Models
SQLAlchemy ORM models for users, suggestions, and votes
"""
from sqlalchemy import Column, String, Integer, Text, ForeignKey, DateTime, TIMESTAMP
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from pgvector.sqlalchemy import Vector
import uuid
from database.connection import Base


class User(Base):
    """User model for authentication and authorization"""
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    full_name = Column(String(255))
    password_hash = Column(String(255), nullable=False)
    role = Column(String(50), default="ambassador")  # 'ambassador' or 'manager'
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    
    # Relationships
    suggestions = relationship("Suggestion", back_populates="user")
    votes = relationship("Vote", back_populates="user")


class Suggestion(Base):
    """Suggestion model for storing ambassador ideas"""
    __tablename__ = "suggestions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    title = Column(String(200), nullable=False)
    description = Column(Text)
    embedding = Column(Vector(1536))  # OpenAI embedding vector
    vote_count = Column(Integer, default=0, index=True)  # Indexed for fast sorting
    status = Column(String(50), default="pending")  # 'pending', 'approved', 'rejected'
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="suggestions")
    votes = relationship("Vote", back_populates="suggestion")


class Vote(Base):
    """Vote model for tracking user votes on suggestions"""
    __tablename__ = "votes"
    
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    suggestion_id = Column(UUID(as_uuid=True), ForeignKey("suggestions.id", ondelete="CASCADE"), primary_key=True)
    voted_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="votes")
    suggestion = relationship("Suggestion", back_populates="votes")
