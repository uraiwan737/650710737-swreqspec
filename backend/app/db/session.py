import os
from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker


DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+psycopg://localhost/booking")


def build_engine(database_url: str | None = None):
    # รองรับ CON-TECH-01 ด้วยการเชื่อมต่อฐานข้อมูลผ่าน DATABASE_URL
    return create_engine(database_url or DATABASE_URL, pool_pre_ping=True)


engine = build_engine()
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


def get_db() -> Generator[Session, None, None]:
    # รองรับ CON-TECH-01 ด้วย session สำหรับเข้าถึงฐานข้อมูลที่ตั้งค่าไว้
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()
