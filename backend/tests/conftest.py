from collections.abc import Generator
from importlib import import_module

import pytest
from sqlalchemy import create_engine, inspect
from sqlalchemy.orm import Session, sessionmaker

from app.db.models import Base


upgrade = import_module("app.db.migrations.001_init").upgrade


@pytest.fixture
def db_session() -> Generator[Session, None, None]:
    engine = create_engine("sqlite+pysqlite:///:memory:")
    upgrade(engine)
    session_factory = sessionmaker(bind=engine, autoflush=False, autocommit=False)
    session = session_factory()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(engine)
        engine.dispose()


@pytest.fixture
def database_tables() -> Generator[set[str], None, None]:
    engine = create_engine("sqlite+pysqlite:///:memory:")
    upgrade(engine)
    try:
        yield set(inspect(engine).get_table_names())
    finally:
        Base.metadata.drop_all(engine)
        engine.dispose()
