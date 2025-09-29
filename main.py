from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.responses import JSONResponse
from database import Base, engine
from ocpp_router import ChargePoint
from status_api import router as status_router
from ws_bridge import OcppFastApiWebSocketBridge
import uvicorn
import os
from datetime import datetime

app = FastAPI(
    title="EV Charging Backend API",
    description="Backend API for EV Charging Station Management",
    version="1.0.0"
)

Base.metadata.create_all(bind=engine)
app.include_router(status_router)

@app.get("/health")
async def health_check():
    """Health check endpoint for load balancers and monitoring"""
    return JSONResponse(
        status_code=200,
        content={
            "status": "healthy",
            "timestamp": datetime.utcnow().isoformat(),
            "version": "1.0.0",
            "environment": os.getenv("ENVIRONMENT", "production")
        }
    )

@app.get("/")
async def root():
    """Root endpoint with API information"""
    return JSONResponse(
        status_code=200,
        content={
            "message": "EV Charging Backend API",
            "version": "1.0.0",
            "docs": "/docs",
            "health": "/health"
        }
    )

@app.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    await websocket.accept()
    print(f"[INFO] Client connected: {client_id}")
    
    # Send connection confirmation message
    try:
        await websocket.send_text('{"type": "connection", "status": "connected", "client_id": "' + client_id + '"}')
        print(f"[INFO] Sent connection confirmation to: {client_id}")
    except Exception as e:
        print(f"[ERROR] Failed to send connection confirmation: {e}")

    bridge = OcppFastApiWebSocketBridge(websocket)
    cp = ChargePoint(client_id, bridge)

    try:
        await cp.start()
    except WebSocketDisconnect:
        print(f"[INFO] WebSocket disconnected: {client_id}")
    except Exception as e:
        print(f"[ERROR] WebSocket error: {e}")
    finally:
        if not websocket.client_state.name == "DISCONNECTED":
            try:
                await websocket.close()
            except Exception as close_error:
                print(f"[WARN] WebSocket close error: {close_error}")
        print(f"[INFO] Client disconnected: {client_id}")

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=9000, reload=True)
