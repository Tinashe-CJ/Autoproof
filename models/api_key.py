from sqlalchemy import String, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship, Mapped, mapped_column
from sqlalchemy.sql import func
from config.database import Base
from typing import Optional


class APIKey(Base):
    __tablename__ = "api_keys"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    name: Mapped[str] = mapped_column(String, nullable=False)
    key_hash: Mapped[str] = mapped_column(String, nullable=False)  # Hashed API key
    key_prefix: Mapped[str] = mapped_column(String, nullable=False)  # First 8 chars for display
    user_id: Mapped[Optional[str]] = mapped_column(String, ForeignKey("users.id"))
    team_id: Mapped[Optional[str]] = mapped_column(String, ForeignKey("teams.id"))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    last_used_at: Mapped[Optional[DateTime]] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="api_keys")
    team: Mapped["Team"] = relationship("Team", back_populates="api_keys")