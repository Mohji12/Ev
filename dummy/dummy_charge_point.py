# dummy_charge_point.py

import asyncio
import websockets
import logging
from ocpp.v16 import ChargePoint as CP
from ocpp.v16 import call
from datetime import datetime

logging.basicConfig(level=logging.INFO)


class DummyChargePoint(CP):
    def _now(self):
        return datetime.utcnow().replace(microsecond=0).isoformat()

    async def start_simulation(self):
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
        print(f"Transaction ID used in MeterValues: {transaction_id} (type={type(transaction_id)})")
        print(f"Transaction ID used in MeterValues: {transaction_id} (type={type(transaction_id)})")
        logging.info("StartTransaction response: %s", start_response)
        await asyncio.sleep(1)

        # Send MeterValues (SoC and electrical parameters)
        await self.call(call.MeterValuesPayload(
            connector_id=1,
            transaction_id=transaction_id,
            meter_value=[{
                "timestamp": self._now(),
                "sampledValue": [
                    {"value": "25", "measurand": "SoC", "unit": "Percent"},
                    {"value": "2.5", "measurand": "Power.Active.Import", "unit": "kW"},
                    {"value": "230", "measurand": "Voltage", "unit": "V"},
                    {"value": "11", "measurand": "Current.Import", "unit": "A"},
                ]
            }]
        ))
        logging.info("MeterValues sent.")
        await asyncio.sleep(1)

        # StopTransaction
        stop_response = await self.call(call.StopTransactionPayload(
            transaction_id=transaction_id,
            meter_stop=130,  # Already an integer
            timestamp=self._now(),
            id_tag="EV001"
        ))
        logging.info("StopTransaction response: %s", stop_response)
        await asyncio.sleep(1)


async def main():
    try:
        async with websockets.connect('ws://127.0.0.1:9000/ws/EV001') as ws:
            cp = DummyChargePoint('EV001', ws)

            # Start background task for incoming messages
            asyncio.create_task(cp.start())

            # Wait a moment for WebSocket registration
            await asyncio.sleep(1)

            # Begin test scenario
            await cp.start_simulation()
    except Exception as e:
        logging.error(f"Connection error: {e}")


if __name__ == '__main__':
    asyncio.run(main())
