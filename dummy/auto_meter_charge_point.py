# auto_meter_charge_point.py - Automatically generates meter readings

import asyncio
import websockets
import logging
from ocpp.v16 import ChargePoint as CP
from ocpp.v16 import call
from datetime import datetime
import random

logging.basicConfig(level=logging.INFO)

class AutoMeterChargePoint(CP):
    def _now(self):
        return datetime.utcnow().replace(microsecond=0).isoformat()

    async def start_auto_charging_simulation(self):
        # Send BootNotification
        boot_response = await self.call(call.BootNotificationPayload(
            charge_point_model="ACME Model X",
            charge_point_vendor="ACME Corp",
            firmware_version="1.0"
        ))
        logging.info("BootNotification response: %s", boot_response)
        await asyncio.sleep(1)

        # StartTransaction
        start_response = await self.call(call.StartTransactionPayload(
            connector_id=1,
            id_tag="EV001",
            meter_start=100,
            timestamp=self._now()
        ))
        if not start_response or not hasattr(start_response, "transaction_id"):
            logging.error("StartTransaction failed: No transaction_id received.")
            return

        transaction_id = start_response.transaction_id
        logging.info("StartTransaction response: %s", start_response)
        
        # Simulate charging over time with multiple meter readings
        current_soc = 25
        current_power = 2.5
        current_voltage = 230
        current_current = 11
        meter_value = 100
        
        # Generate 5 meter readings over 10 seconds
        for i in range(5):
            await asyncio.sleep(2)  # Wait 2 seconds between readings
            
            # Simulate charging progress
            current_soc = min(85, current_soc + random.uniform(3, 8))  # Increase SoC
            current_power = max(0.5, current_power + random.uniform(-0.3, 0.3))  # Power variation
            current_voltage = 230 + random.uniform(-5, 5)  # Voltage variation
            current_current = 11 + random.uniform(-1, 1)  # Current variation
            meter_value += random.uniform(2, 5)  # Increase energy consumption
            
            # Send MeterValues
            await self.call(call.MeterValuesPayload(
                connector_id=1,
                transaction_id=transaction_id,
                meter_value=[{
                    "timestamp": self._now(),
                    "sampledValue": [
                        {"value": str(int(current_soc)), "measurand": "SoC", "unit": "Percent"},
                        {"value": f"{current_power:.1f}", "measurand": "Power.Active.Import", "unit": "kW"},
                        {"value": f"{current_voltage:.0f}", "measurand": "Voltage", "unit": "V"},
                        {"value": f"{current_current:.0f}", "measurand": "Current.Import", "unit": "A"},
                    ]
                }]
            ))
            logging.info(f"MeterValues {i+1}/5 sent - SoC: {current_soc:.0f}%, Power: {current_power:.1f}kW")

        # StopTransaction
        stop_response = await self.call(call.StopTransactionPayload(
            transaction_id=transaction_id,
            meter_stop=int(meter_value),  # Convert to integer
            timestamp=self._now(),
            id_tag="EV001"
        ))
        logging.info("StopTransaction response: %s", stop_response)
        await asyncio.sleep(1)


async def main():
    try:
        async with websockets.connect('ws://127.0.0.1:9000/ws/EV001') as ws:
            cp = AutoMeterChargePoint('EV001', ws)

            # Start background task for incoming messages
            asyncio.create_task(cp.start())

            # Wait a moment for WebSocket registration
            await asyncio.sleep(1)

            # Begin auto charging simulation
            await cp.start_auto_charging_simulation()
    except Exception as e:
        logging.error(f"Connection error: {e}")


if __name__ == '__main__':
    asyncio.run(main())
