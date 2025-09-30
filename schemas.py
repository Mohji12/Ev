from pydantic import BaseModel, validator
from datetime import datetime
from typing import Optional


# ---------- Charging Session Schemas ----------
class ChargingSessionCreate(BaseModel):
    ev_id: str
    connector_id: int
    start_meter: float
    start_soc: Optional[int] = 0
    start_time: Optional[datetime] = None  # Optional for explicit control


class ChargingSession(ChargingSessionCreate):
    id: int
    end_time: Optional[datetime]
    end_meter: Optional[float]
    end_soc: Optional[int]

    @validator('end_time', pre=True)
    def validate_end_time(cls, v):
        if v is None or v == '0000-00-00 00:00:00' or str(v) == '0000-00-00 00:00:00':
            return None
        return v

    @validator('start_time', pre=True)
    def validate_start_time(cls, v):
        if v is None or v == '0000-00-00 00:00:00' or str(v) == '0000-00-00 00:00:00':
            return None
        return v

    class Config:
        orm_mode = True


# ---------- Meter Value Schemas ----------
class MeterValueCreate(BaseModel):
    session_id: int
    timestamp: Optional[datetime] = None
    voltage: Optional[float]
    current: Optional[float]
    power_kw: Optional[float]
    soc: Optional[int]

class MeterValue(MeterValueCreate):
    id: int
    timestamp: datetime

    @validator('timestamp', pre=True)
    def validate_timestamp(cls, v):
        if v is None or v == '0000-00-00 00:00:00' or str(v) == '0000-00-00 00:00:00':
            return None
        return v

    class Config:
        orm_mode = True
