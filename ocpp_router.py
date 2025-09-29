from fastapi import WebSocket
from ocpp.routing import on
from ocpp.v16 import ChargePoint as CP
from ocpp.v16.enums import RegistrationStatus
from ocpp.v16 import call_result

from database import SessionLocal
import crud, schemas, models
from datetime import datetime

class ChargePoint(CP):
    def _now(self):
        return datetime.utcnow().replace(microsecond=0).isoformat()
    
    async def generate_initial_meter_reading(self, db, session_id, ev_id):
        """Generate initial meter reading for a new session"""
        try:
            # Generate realistic initial values
            initial_soc = 25  # Start with 25% SoC
            initial_power = 2.5  # 2.5 kW
            initial_voltage = 230.0  # 230V
            initial_current = 11.0  # 11A
            
            meter_data = schemas.MeterValueCreate(
                session_id=session_id,
                timestamp=self._now(),
                voltage=initial_voltage,
                current=initial_current,
                power_kw=initial_power,
                soc=initial_soc
            )
            
            result = crud.add_meter_value(db, meter_data)
            if result:
                print(f"[AUTO] Initial meter reading created for session {session_id}: {initial_power}kW, {initial_soc}% SoC")
            else:
                print(f"[AUTO ERROR] Failed to create initial meter reading for session {session_id}")
                
        except Exception as e:
            print(f"[AUTO ERROR] Failed to generate initial meter reading: {e}")
    
    async def generate_periodic_meter_reading(self, db, session_id, ev_id, iteration=0):
        """Generate periodic meter readings during charging"""
        try:
            # Simulate charging progress
            base_soc = 25 + (iteration * 5)  # Increase SoC by 5% each time
            base_power = 2.5 + (iteration * 0.1)  # Slight power increase
            base_voltage = 230.0 + (iteration * 0.5)  # Slight voltage increase
            base_current = 11.0 + (iteration * 0.2)  # Slight current increase
            
            # Cap the values
            soc = min(85, base_soc)
            power = min(3.0, base_power)
            voltage = min(240.0, base_voltage)
            current = min(13.0, base_current)
            
            meter_data = schemas.MeterValueCreate(
                session_id=session_id,
                timestamp=self._now(),
                voltage=voltage,
                current=current,
                power_kw=power,
                soc=int(soc)
            )
            
            result = crud.add_meter_value(db, meter_data)
            if result:
                print(f"[AUTO] Periodic meter reading {iteration+1} for session {session_id}: {power:.1f}kW, {soc:.0f}% SoC")
            else:
                print(f"[AUTO ERROR] Failed to create periodic meter reading for session {session_id}")
                
        except Exception as e:
            print(f"[AUTO ERROR] Failed to generate periodic meter reading: {e}")

    @on("BootNotification")
    async def on_boot_notification(self, charge_point_model, firmware_version, **kwargs):
        print(f"[BOOT] BootNotification from {self.id}")
        return call_result.BootNotificationPayload(
            current_time=self._now(),
            interval=10,
            status=RegistrationStatus.accepted
        )

    @on("StartTransaction")
    async def on_start_transaction(self, connector_id, id_tag, meter_start, timestamp, **kwargs):
        print(f"[START] StartTransaction from {id_tag} on connector {connector_id}")
        db = SessionLocal()
        try:
            session = crud.create_charging_session(db, schemas.ChargingSessionCreate(
                ev_id=id_tag,
                connector_id=connector_id,
                start_meter=meter_start,
                start_soc=kwargs.get("soc")
            ))
            print(f"[DB] Charging session created: ID={session.id}, EV_ID={id_tag}")
            
            # Auto-generate initial meter reading for the session
            await self.generate_initial_meter_reading(db, session.id, id_tag)
            
            return call_result.StartTransactionPayload(
                transaction_id=session.id,
                id_tag_info={"status": "Accepted"}
            )
        except Exception as e:
            print(f"[ERROR] Failed to start transaction: {e}")
            raise
        finally:
            db.close()

    @on("MeterValues")
    async def on_meter_values(self, connector_id, meter_value, transaction_id=None, **kwargs):
        print(f"[METER] Received MeterValues for transaction {transaction_id}")
        print(f"[METER] connector_id: {connector_id}")
        print(f"[METER] meter_value: {meter_value}")
        print(f"[METER] transaction_id: {transaction_id}")
        print(f"[METER] kwargs: {kwargs}")
        
        if not transaction_id:
            print(f"[METER ERROR] No transaction_id provided")
            return call_result.MeterValuesPayload()
            
        db = SessionLocal()
        try:
            for mv in meter_value:
                timestamp = mv.get("timestamp", datetime.utcnow().isoformat())
                sampled_values = mv.get("sampledValue", [])

                if not sampled_values:
                    print(f"[WARNING] Missing 'sampledValue' in meterValue at timestamp {timestamp}")
                    continue

                print(f"[DEBUG] sampledValue entries: {sampled_values}")

                voltage = current = power_kw = soc = None

                for sampled in sampled_values:
                    measurand = sampled.get('measurand')
                    try:
                        value = float(sampled.get('value', 0))
                    except ValueError:
                        print(f"[WARNING] Invalid value in sampledValue: {sampled.get('value')}")
                        continue

                    if measurand == 'Voltage':
                        voltage = value
                    elif measurand == 'Current.Import':
                        current = value
                    elif measurand == 'Power.Active.Import':
                        power_kw = value
                    elif measurand == 'SoC':
                        soc = int(value)

                if any(v is not None for v in [voltage, current, power_kw, soc]):
                    insert_payload = schemas.MeterValueCreate(
                        session_id=transaction_id,
                        timestamp=timestamp,
                        voltage=voltage,
                        current=current,
                        power_kw=power_kw,
                        soc=soc
                    )
                    print(f"[DEBUG] Inserting meter value: session_id={transaction_id}, "
      f"timestamp={timestamp}, voltage={voltage}, current={current}, "
      f"power_kw={power_kw}, soc={soc}")

                    print(f"[DEBUG] Prepared for DB insert: {insert_payload}")
                    result = crud.add_meter_value(db, insert_payload)
                    if result:
                        print(f"[DB] MeterValue stored for Session_ID={transaction_id}")
                    else:
                        print(f"[DB ERROR] Insert failed for Session_ID={transaction_id}")
                else:
                    print(f"[WARNING] No measurable values found in sampledValue.")
        except Exception as e:
            print(f"[ERROR] Failed to process MeterValues: {e}")
            raise
        finally:
            db.close()

        return call_result.MeterValuesPayload()

    @on("StopTransaction")
    async def on_stop_transaction(self, transaction_id, meter_stop, timestamp, **kwargs):
        print(f"[STOP] StopTransaction for session {transaction_id}")
        print(f"[STOP] meter_stop: {meter_stop}, timestamp: {timestamp}")
        print(f"[STOP] kwargs: {kwargs}")
        
        db = SessionLocal()
        try:
            # Get the latest SoC from meter values for this session
            latest_meter = db.query(models.MeterValue).filter(
                models.MeterValue.session_id == transaction_id
            ).order_by(models.MeterValue.timestamp.desc()).first()
            
            final_soc = latest_meter.soc if latest_meter else None
            print(f"[STOP] Final SoC from meter values: {final_soc}")
            
            crud.end_charging_session(db, transaction_id, end_meter=meter_stop, end_soc=final_soc)
            print(f"[DB] Charging session ended: ID={transaction_id}, end_meter={meter_stop}, end_soc={final_soc}")
        except Exception as e:
            print(f"[ERROR] Failed to stop transaction: {e}")
            raise
        finally:
            db.close()

        return call_result.StopTransactionPayload(
            id_tag_info={"status": "Accepted"}
        )
