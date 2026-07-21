"""Seed script to create an initial Super Admin user.

Credentials are read from environment variables so they are never
committed to source control:

    ADMIN_EMAIL     (default: admin@example.com)
    ADMIN_PASSWORD  (required; the script exits if it is not set)
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.session import SessionLocal
from app.db.models import User, UserRole
from app.core.security import get_password_hash

def seed():
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@example.com")
    admin_password = os.environ.get("ADMIN_PASSWORD")
    if not admin_password:
        print("ERROR: ADMIN_PASSWORD environment variable is not set.")
        print("   Set it before running, e.g. (PowerShell):")
        print('   $env:ADMIN_PASSWORD = "your-strong-password"')
        sys.exit(1)

    db = SessionLocal()
    try:
        # Check if user already exists
        existing = db.query(User).filter(User.email == admin_email).first()
        if existing:
            print(f"User {admin_email} already exists!")
            return

        user = User(
            email=admin_email,
            hashed_password=get_password_hash(admin_password),
            role=UserRole.SUPER_ADMIN,
            is_active=True,
        )
        db.add(user)
        db.commit()
        print("SUCCESS: Super Admin user created!")
        print(f"   Email:    {admin_email}")
        print(f"   Password: (from ADMIN_PASSWORD env var)")
        print(f"   Role:     SUPER_ADMIN")
    finally:
        db.close()

if __name__ == "__main__":
    seed()
