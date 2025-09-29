from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
import models, schemas
from datetime import datetime


def create_charging_session(db: Session, session_data: schemas.ChargingSessionCreate):
    data = session_data.dict()
    data["start_soc"] = data.get("start_soc") or 0
    data["start_time"] = data.get("start_time") or datetime.utcnow()

    db_session = models.ChargingSession(**data)
    db.add(db_session)
    try:
        db.commit()
        db.refresh(db_session)
        print(f"[DB] Charging session created: ID={db_session.id}, EV_ID={db_session.ev_id}")
    except SQLAlchemyError as e:
        db.rollback()
        print(f"[DB ERROR] Failed to create charging session: {e}")
        return None
    return db_session


def end_charging_session(db: Session, session_id: int, end_meter: float, end_soc: int | None = None, end_time: datetime | None = None):
    session = db.query(models.ChargingSession).filter(models.ChargingSession.id == session_id).first()
    if session:
        session.end_time = end_time or datetime.utcnow()
        session.end_meter = end_meter
        session.end_soc = end_soc or 0
        try:
            db.commit()
            db.refresh(session)
            print(f"[DB] Charging session ended: ID={session.id}")
        except SQLAlchemyError as e:
            db.rollback()
            print(f"[DB ERROR] Failed to end charging session: {e}")
    else:
        print(f"[DB WARNING] No session found with ID={session_id}")
    return session


def add_meter_value(db: Session, data: schemas.MeterValueCreate):
    reading_data = data.dict()

    print(f"[DEBUG] Incoming meter value data: {reading_data}")

    reading_data["soc"] = reading_data.get("soc") or 0
    reading_data["timestamp"] = reading_data.get("timestamp") or datetime.utcnow()

    # Validate session existence
    session_exists = db.query(models.ChargingSession).filter(
        models.ChargingSession.id == reading_data["session_id"]
    ).first()

    if not session_exists:
        print(f"[DB ERROR] No charging session found with ID={reading_data['session_id']} to insert meter value.")
        return None

    # Ensure at least one of the values exists
    if all(reading_data.get(k) is None for k in ["voltage", "current", "power_kw", "soc"]):
        print(f"[DB WARNING] No valid meter values found to insert for Session_ID={reading_data['session_id']}")
        return None

    reading = models.MeterValue(**reading_data)
    db.add(reading)

    try:
        db.commit()
        db.refresh(reading)
        print(f"[DB] Meter value added: Session_ID={reading.session_id}, "
              f"Voltage={reading.voltage}, Current={reading.current}, "
              f"Power={reading.power_kw}, SoC={reading.soc}%")
    except SQLAlchemyError as e:
        db.rollback()
        print(f"[DB ERROR] Failed to insert meter value: {e}")
        return None

    return reading
