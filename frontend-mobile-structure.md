# EV Charging Mobile App Structure

## Project Structure
```
ev-charging-mobile/
├── src/
│   ├── components/           # Reusable UI components
│   │   ├── common/
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── LoadingSpinner.tsx
│   │   │   └── StatusIndicator.tsx
│   │   ├── charging/
│   │   │   ├── ChargingCard.tsx
│   │   │   ├── SessionCard.tsx
│   │   │   ├── MeterDisplay.tsx
│   │   │   └── ProgressBar.tsx
│   │   └── forms/
│   │       ├── StartChargingForm.tsx
│   │       └── StopChargingForm.tsx
│   ├── screens/             # App screens
│   │   ├── auth/
│   │   │   ├── LoginScreen.tsx
│   │   │   └── RegisterScreen.tsx
│   │   ├── dashboard/
│   │   │   ├── DashboardScreen.tsx
│   │   │   └── StationListScreen.tsx
│   │   ├── charging/
│   │   │   ├── ActiveChargingScreen.tsx
│   │   │   ├── SessionHistoryScreen.tsx
│   │   │   └── StationDetailsScreen.tsx
│   │   └── profile/
│   │       ├── ProfileScreen.tsx
│   │       └── SettingsScreen.tsx
│   ├── services/            # API services
│   │   ├── api.ts
│   │   ├── chargingService.ts
│   │   ├── authService.ts
│   │   └── websocketService.ts
│   ├── hooks/               # Custom React hooks
│   │   ├── useChargingStatus.ts
│   │   ├── useWebSocket.ts
│   │   └── useAuth.ts
│   ├── store/               # State management
│   │   ├── authStore.ts
│   │   ├── chargingStore.ts
│   │   └── index.ts
│   ├── types/               # TypeScript types
│   │   ├── api.ts
│   │   ├── charging.ts
│   │   └── auth.ts
│   ├── utils/               # Utility functions
│   │   ├── constants.ts
│   │   ├── helpers.ts
│   │   └── validators.ts
│   └── navigation/          # Navigation setup
│       ├── AppNavigator.tsx
│       ├── AuthNavigator.tsx
│       └── TabNavigator.tsx
├── app.json
├── package.json
└── tsconfig.json
```

## Key Features
- Real-time charging status updates
- Push notifications for charging events
- Offline capability for viewing session history
- QR code scanning for station identification
- Location-based station discovery
- Payment integration
- Session history and analytics
