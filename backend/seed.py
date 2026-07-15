"""Seed script to create an initial Super Admin user."""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.session import SessionLocal
from app.db.models import User, UserRole
from app.core.security import get_password_hash

def seed():
    db = SessionLocal()
    try:
        # Check if user already exists
        existing = db.query(User).filter(User.email == "suraj@123.com").first()
        if existing:
            print("User suraj@123.com already exists!")
            return

        user = User(
            email="suraj@123.com",
            hashed_password=get_password_hash("shital001"),
            role=UserRole.SUPER_ADMIN,
            is_active=True,
        )
        db.add(user)
        db.commit()
        print("SUCCESS: Super Admin user created!")
        print(f"   Email:    suraj@123.com")
        print(f"   Password: shital001")
        print(f"   Role:     SUPER_ADMIN")
    finally:
        db.close()

if __name__ == "__main__":
    seed()
