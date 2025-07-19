from sqlalchemy import String, DateTime, Boolean, ForeignKey, Enum
from sqlalchemy.orm import relationship, Mapped, mapped_column
from sqlalchemy.sql import func
from config.database import Base
from typing import TYPE_CHECKING, List, Optional
from datetime import datetime
import enum

if TYPE_CHECKING:
    from models.team import Team
    from models.api_key import APIKey
    from models.usage_log import UsageLog

class UserRole(enum.Enum):
    """User roles for role-based access control"""
    ADMIN = "admin"
    MEMBER = "member"
    VIEWER = "viewer"

class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(primary_key=True)
    clerk_id: Mapped[str] = mapped_column(String, unique=True, index=True)
    email: Mapped[str] = mapped_column(String, unique=True, index=True)
    first_name: Mapped[str] = mapped_column(String)
    last_name: Mapped[str] = mapped_column(String)
    team_id: Mapped[str] = mapped_column(ForeignKey("teams.id"))
    role: Mapped[str] = mapped_column("user_role", String, default="member")
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    team: Mapped['Team'] = relationship("Team", back_populates="users")
    api_keys: Mapped[List['APIKey']] = relationship("APIKey", back_populates="user")
    usage_logs: Mapped[List['UsageLog']] = relationship("UsageLog", back_populates="user")

    def has_permission(self, permission: str) -> bool:
        """Check if user has a specific permission based on their role"""
        permissions = {
            UserRole.ADMIN: [
                "read", "write", "delete", "manage_users", "manage_team", 
                "manage_policies", "manage_violations", "view_analytics", "manage_billing"
            ],
            UserRole.MEMBER: [
                "read", "write", "manage_policies", "manage_violations", "view_analytics"
            ],
            UserRole.VIEWER: [
                "read", "view_analytics"
            ]
        }
        return permission in permissions.get(self.role, [])

    def is_admin(self) -> bool:
        """Check if user is an admin"""
        return self.role == UserRole.ADMIN

    def is_member(self) -> bool:
        """Check if user is a member"""
        return self.role == UserRole.MEMBER

    def is_viewer(self) -> bool:
        """Check if user is a viewer"""
        return self.role == UserRole.VIEWER