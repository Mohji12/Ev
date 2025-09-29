from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# MySQL DB connection URI (make sure credentials are correct and secure in production)
#DATABASE_URL = "mysql+pymysql://root:Mohangola123%40@localhost:3306/EVstation"
DATABASE_URL = "mysql+pymysql://admin:Mohangola%23123@database-1.cfiuwyek2vbk.ap-south-1.rds.amazonaws.com:3306/Ev_machine"


# Create SQLAlchemy engine with connection pool recycle
engine = create_engine(
    DATABASE_URL,
    pool_recycle=3600,
    echo=False,  # Set to True for SQL query debug logs
    future=True
)

# Session factory bound to engine
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# Base class for declarative models
Base = declarative_base()

# FastAPI dependency to provide DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
