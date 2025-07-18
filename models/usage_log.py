from sqlalchemy import String, DateTime, Integer, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship, Mapped, mapped_column
from sqlalchemy.sql import func
from config.database import Base
from typing import Optional


class UsageLog(Base):
    __tablename__ = "usage_logs"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    user_id: Mapped[Optional[str]] = mapped_column(String, ForeignKey("users.id"))
    team_id: Mapped[Optional[str]] = mapped_column(String, ForeignKey("teams.id"))
    api_key_id: Mapped[Optional[str]] = mapped_column(String, ForeignKey("api_keys.id"))

    # Request details
    endpoint: Mapped[str] = mapped_column(String, nullable=False)
    method: Mapped[str] = mapped_column(String, nullable=False)

    # Usage metrics
    tokens_used: Mapped[int] = mapped_column(Integer, default=0)
    request_size: Mapped[Optional[int]] = mapped_column(Integer)
    response_size: Mapped[Optional[int]] = mapped_column(Integer)
    processing_time: Mapped[Optional[int]] = mapped_column(Integer)

    # Analysis details
    analysis_type: Mapped[Optional[str]] = mapped_column(String)
    input_text: Mapped[Optional[str]] = mapped_column(Text)
    analysis_result: Mapped[Optional[dict]] = mapped_column(JSON)

    created_at: Mapped[Optional[DateTime]] = mapped_column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="usage_logs")
    team: Mapped["Team"] = relationship("Team", back_populates="usage_logs")