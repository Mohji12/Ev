import axios from 'axios';
import { ChargingSession, MeterValue, ChargingStatus } from '../types';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// API service for EV charging backend
export const chargingApi = {
  // Get current charging status for an EV
  getCurrentStatus: async (evId: string): Promise<ChargingStatus | null> => {
    try {
      const response = await api.get(`/status/current/${evId}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        // No active session found - this is normal
        return null;
      }
      throw error;
    }
  },

  // Get all charging sessions for an EV
  getSessions: async (evId: string): Promise<ChargingSession[]> => {
    const response = await api.get(`/status/sessions/${evId}`);
    return response.data;
  },

  // Get meter values for a specific session
  getMeterValues: async (sessionId: number): Promise<MeterValue[]> => {
    const response = await api.get(`/status/meter-values/${sessionId}`);
    return response.data;
  },
};

// WebSocket service for real-time updates
export class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  connect(clientId: string, onMessage: (data: any) => void, onError?: (error: Event) => void) {
    try {
      console.log(`Attempting to connect to ws://127.0.0.1:9000/ws/${clientId}`);
      this.ws = new WebSocket(`ws://127.0.0.1:9000/ws/${clientId}`);
      
      this.ws.onopen = () => {
        console.log('WebSocket connected successfully');
        this.reconnectAttempts = 0;
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('WebSocket message received:', data);
          onMessage(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.ws.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        this.attemptReconnect(clientId, onMessage, onError);
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        if (onError) onError(error);
      };
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
    }
  }

  private attemptReconnect(clientId: string, onMessage: (data: any) => void, onError?: (error: Event) => void) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        this.connect(clientId, onMessage, onError);
      }, this.reconnectDelay * this.reconnectAttempts);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  send(message: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }
}

export default chargingApi;
