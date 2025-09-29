from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import SessionLocal
import models, schemas
from datetime import datetime
from typing import List

router = APIRouter(prefix="/status", tags=["Charging Status"])

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/current/{ev_id}")
def get_current_charging_status(ev_id: str, db: Session = Depends(get_db)):
    session = (
        db.query(models.ChargingSession)
        .filter(models.ChargingSession.ev_id == ev_id)
        .order_by(models.ChargingSession.start_time.desc())
        .first()
    )
    if not session:
        raise HTTPException(status_code=404, detail="No session found for EV ID")

    last_meter = (
        db.query(models.MeterValue)
        .filter(models.MeterValue.session_id == session.id)
        .order_by(models.MeterValue.timestamp.desc())
        .first()
    )

    soc = last_meter.soc if last_meter and last_meter.soc is not None else session.start_soc or 0
    return {
        "ev_id": session.ev_id,
        "session_id": session.id,
        "start_time": session.start_time,
        "current_time": datetime.utcnow(),
        "current_soc": soc,
        "remaining_percent": 100 - soc,
        "power_kw": last_meter.power_kw if last_meter else None,
        "voltage": last_meter.voltage if last_meter else None,
        "current": last_meter.current if last_meter else None
    }

@router.get("/sessions/{ev_id}", response_model=List[schemas.ChargingSession])
def get_all_sessions(ev_id: str, db: Session = Depends(get_db)):
    sessions = db.query(models.ChargingSession).filter_by(ev_id=ev_id).all()
    return sessions

@router.get("/meter-values/{session_id}", response_model=List[schemas.MeterValue])
def get_meter_values(session_id: int, db: Session = Depends(get_db)):
    readings = (
        db.query(models.MeterValue)
        .filter_by(session_id=session_id)
        .order_by(models.MeterValue.timestamp)
        .all()
    )
    return readings
