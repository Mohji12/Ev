# EV Charging Web Application Structure

## Project Structure
```
ev-charging-web/
├── src/
│   ├── components/          # Reusable components
│   │   ├── ui/             # Base UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── Table.tsx
│   │   ├── layout/         # Layout components
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── Footer.tsx
│   │   ├── charging/       # Charging-specific components
│   │   │   ├── ChargingDashboard.tsx
│   │   │   ├── StationMap.tsx
│   │   │   ├── SessionTable.tsx
│   │   │   └── RealTimeMonitor.tsx
│   │   └── forms/          # Form components
│   │       ├── StationForm.tsx
│   │       └── UserForm.tsx
│   ├── pages/              # Next.js pages
│   │   ├── api/            # API routes (if needed)
│   │   ├── dashboard/
│   │   │   └── index.tsx
│   │   ├── stations/
│   │   │   ├── index.tsx
│   │   │   └── [id].tsx
│   │   ├── sessions/
│   │   │   ├── index.tsx
│   │   │   └── [id].tsx
│   │   ├── analytics/
│   │   │   └── index.tsx
│   │   └── settings/
│   │       └── index.tsx
│   ├── lib/                # Utilities and configurations
│   │   ├── api.ts
│   │   ├── auth.ts
│   │   ├── websocket.ts
│   │   └── utils.ts
│   ├── hooks/              # Custom hooks
│   │   ├── useChargingData.ts
│   │   ├── useWebSocket.ts
│   │   └── useAuth.ts
│   ├── store/              # State management
│   │   ├── authStore.ts
│   │   ├── chargingStore.ts
│   │   └── uiStore.ts
│   ├── types/              # TypeScript definitions
│   │   ├── api.ts
│   │   ├── charging.ts
│   │   └── user.ts
│   └── styles/             # Styling
│       ├── globals.css
│       └── components.css
├── public/                 # Static assets
├── next.config.js
├── package.json
└── tailwind.config.js
```

## Key Features
- Admin dashboard for station management
- Real-time monitoring of all charging stations
- Analytics and reporting
- User management
- Station configuration
- Bulk operations
- Export capabilities
