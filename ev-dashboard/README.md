# EV Charging Dashboard

A modern React + Vite web dashboard for monitoring EV charging sessions in real-time.

## Features

- **Real-time Monitoring**: Live charging status with WebSocket integration
- **Session Management**: View and track charging sessions
- **Data Visualization**: Interactive charts for power, voltage, current, and SoC
- **Responsive Design**: Modern UI with Tailwind CSS
- **Multi-EV Support**: Switch between different EV IDs

## Prerequisites

- Node.js (v16 or higher)
- Your EV Backend running on `http://localhost:9000`

## Installation

1. Navigate to the dashboard directory:
   ```bash
   cd ev-dashboard
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:3000`

## Usage

1. **Start your EV Backend**: Make sure your FastAPI backend is running on port 9000
2. **Enter EV ID**: Use the input field to enter an EV ID (default: EV001)
3. **Monitor Sessions**: View real-time charging status and historical sessions
4. **View Charts**: Click on any session to see detailed meter value charts

## API Integration

The dashboard integrates with your EV backend through:

- **REST API**: `/api/status/current/{ev_id}`, `/api/status/sessions/{ev_id}`, `/api/status/meter-values/{session_id}`
- **WebSocket**: `ws://localhost:9000/ws/{client_id}` for real-time updates

## Project Structure

```
src/
├── components/          # React components
│   ├── Header.tsx      # Dashboard header
│   ├── ChargingStatus.tsx  # Current charging status
│   ├── SessionList.tsx     # List of charging sessions
│   └── RealTimeChart.tsx   # Data visualization
├── services/           # API and WebSocket services
│   └── api.ts         # Backend integration
├── hooks/             # Custom React hooks
│   └── useWebSocket.ts # WebSocket management
├── types/             # TypeScript type definitions
│   └── index.ts       # Data models
├── App.tsx            # Main application component
└── main.tsx           # Application entry point
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Configuration

The dashboard is configured to proxy API requests to your backend:
- API requests to `/api/*` are proxied to `http://localhost:9000`
- WebSocket connections to `/ws/*` are proxied to `ws://localhost:9000`

## Troubleshooting

1. **Connection Issues**: Ensure your EV backend is running on port 9000
2. **No Data**: Check if there are active charging sessions for the EV ID
3. **WebSocket Errors**: Verify the backend WebSocket endpoint is accessible

## Technologies Used

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Recharts** - Data visualization
- **Axios** - HTTP client
- **Lucide React** - Icons
