from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class ChargingSession(Base):
    __tablename__ = "charging_sessions"

    id = Column(Integer, primary_key=True, index=True)
    ev_id = Column(String(100), nullable=False)
    connector_id = Column(Integer, nullable=False)
    start_time = Column(DateTime, default=datetime.utcnow)
    end_time = Column(DateTime, nullable=True)
    start_meter = Column(Float, nullable=False)
    end_meter = Column(Float, nullable=True)
    start_soc = Column(Integer, nullable=True)
    end_soc = Column(Integer, nullable=True)

    meter_values = relationship("MeterValue", back_populates="session", cascade="all, delete-orphan")

class MeterValue(Base):
    __tablename__ = "meter_values"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("charging_sessions.id"), nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    voltage = Column(Float, nullable=True)
    current = Column(Float, nullable=True)
    power_kw = Column(Float, nullable=True)
    soc = Column(Integer, nullable=True)

    session = relationship("ChargingSession", back_populates="meter_values")
