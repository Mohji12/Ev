import { useEffect, useRef, useState } from 'react';

export const useWebSocket = (clientId: string) => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<any>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const connectWebSocket = () => {
      try {
        console.log(`[WebSocket] Attempting to connect to: ws://127.0.0.1:9000/ws/${clientId}`);
        const ws = new WebSocket(`ws://127.0.0.1:9000/ws/${clientId}`);
        wsRef.current = ws;

        ws.onopen = () => {
          console.log('[WebSocket] ✅ Connected successfully to backend');
          console.log('[WebSocket] WebSocket readyState:', ws.readyState);
          setIsConnected(true);
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            console.log('[WebSocket] 📨 Message received:', data);
            
            // Handle connection confirmation
            if (data.type === 'connection' && data.status === 'connected') {
              console.log('[WebSocket] 🎉 Connection confirmed by backend!');
              setIsConnected(true);
            }
            
            setLastMessage(data);
          } catch (error) {
            console.error('[WebSocket] ❌ Error parsing message:', error);
          }
        };

        ws.onclose = (event) => {
          console.log(`[WebSocket] 🔌 Disconnected: Code ${event.code}, Reason: ${event.reason}`);
          setIsConnected(false);
          // Attempt to reconnect after 3 seconds
          setTimeout(() => {
            if (wsRef.current?.readyState === WebSocket.CLOSED) {
              console.log('[WebSocket] 🔄 Attempting to reconnect...');
              connectWebSocket();
            }
          }, 3000);
        };

        ws.onerror = (error) => {
          console.error('[WebSocket] ❌ Connection error:', error);
          setIsConnected(false);
        };
      } catch (error) {
        console.error('[WebSocket] ❌ Failed to create WebSocket:', error);
        setIsConnected(false);
      }
    };

    console.log(`[WebSocket] 🚀 Initializing WebSocket for client: ${clientId}`);
    connectWebSocket();

    return () => {
      console.log(`[WebSocket] 🧹 Cleaning up WebSocket for client: ${clientId}`);
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      setIsConnected(false);
    };
  }, [clientId]);

  const sendMessage = (message: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  };

  return {
    isConnected,
    lastMessage,
    sendMessage,
  };
};
