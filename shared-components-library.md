# Shared Component Library for EV Charging Apps

## Recommended Component Library: **NativeBase** or **Tamagui**

### Why These Libraries?
- **Cross-platform compatibility** (React Native + React Web)
- **Consistent design system**
- **Built-in accessibility features**
- **Performance optimized**
- **TypeScript support**

## Core Components Needed

### 1. **Charging Status Components**

```typescript
// ChargingStatusCard.tsx
interface ChargingStatusCardProps {
  evId: string;
  sessionId: number;
  currentSoc: number;
  powerKw: number;
  voltage: number;
  current: number;
  isActive: boolean;
}

// SessionCard.tsx
interface SessionCardProps {
  session: ChargingSession;
  onViewDetails: (sessionId: number) => void;
}

// MeterDisplay.tsx
interface MeterDisplayProps {
  voltage?: number;
  current?: number;
  powerKw?: number;
  soc?: number;
  timestamp: string;
}
```

### 2. **Progress & Visualization Components**

```typescript
// ChargingProgressBar.tsx
interface ChargingProgressBarProps {
  currentSoc: number;
  targetSoc?: number;
  estimatedTimeRemaining?: string;
  animated?: boolean;
}

// PowerGraph.tsx
interface PowerGraphProps {
  data: MeterValue[];
  timeRange: '1h' | '6h' | '24h' | '7d';
}
```

### 3. **Form Components**

```typescript
// StartChargingForm.tsx
interface StartChargingFormProps {
  onSubmit: (data: StartChargingData) => void;
  availableStations: ChargingStation[];
}

// StationSelector.tsx
interface StationSelectorProps {
  stations: ChargingStation[];
  selectedStation?: ChargingStation;
  onSelect: (station: ChargingStation) => void;
}
```

### 4. **Navigation Components**

```typescript
// BottomTabNavigator.tsx (Mobile)
interface TabNavigatorProps {
  activeTab: 'dashboard' | 'sessions' | 'stations' | 'profile';
  onTabChange: (tab: string) => void;
}

// Sidebar.tsx (Web)
interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  activeRoute: string;
}
```

## Design System Guidelines

### **Color Palette**
```css
:root {
  /* Primary Colors */
  --primary-green: #00C851;      /* Charging active */
  --primary-blue: #007BFF;       /* Primary actions */
  --primary-red: #DC3545;        /* Errors/Stop */
  --primary-orange: #FF8800;     /* Warnings */
  
  /* Status Colors */
  --status-available: #28A745;   /* Station available */
  --status-occupied: #FFC107;    /* Station occupied */
  --status-fault: #DC3545;       /* Station fault */
  --status-offline: #6C757D;     /* Station offline */
  
  /* Neutral Colors */
  --gray-50: #F8F9FA;
  --gray-100: #E9ECEF;
  --gray-500: #6C757D;
  --gray-900: #212529;
}
```

### **Typography Scale**
```css
/* Mobile */
--text-xs: 12px;
--text-sm: 14px;
--text-base: 16px;
--text-lg: 18px;
--text-xl: 20px;
--text-2xl: 24px;

/* Web */
--text-xs: 12px;
--text-sm: 14px;
--text-base: 16px;
--text-lg: 18px;
--text-xl: 20px;
--text-2xl: 24px;
--text-3xl: 30px;
--text-4xl: 36px;
```

### **Spacing System**
```css
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 20px;
--space-6: 24px;
--space-8: 32px;
--space-10: 40px;
--space-12: 48px;
```

## Component Examples

### **Charging Status Card**
```typescript
import { Box, Text, Progress, HStack, VStack } from 'native-base';

export function ChargingStatusCard({ 
  currentSoc, 
  powerKw, 
  voltage, 
  current, 
  isActive 
}: ChargingStatusCardProps) {
  return (
    <Box p={4} bg="white" rounded="lg" shadow={2}>
      <VStack space={3}>
        <HStack justifyContent="space-between" alignItems="center">
          <Text fontSize="lg" fontWeight="bold">
            Charging Status
          </Text>
          <Box 
            bg={isActive ? "green.500" : "gray.400"} 
            px={2} 
            py={1} 
            rounded="full"
          >
            <Text color="white" fontSize="xs">
              {isActive ? "ACTIVE" : "INACTIVE"}
            </Text>
          </Box>
        </HStack>
        
        <VStack space={2}>
          <Text fontSize="3xl" fontWeight="bold" color="green.500">
            {currentSoc}%
          </Text>
          <Progress 
            value={currentSoc} 
            colorScheme="green" 
            size="lg" 
            rounded="full"
          />
        </VStack>
        
        <HStack space={4}>
          <VStack alignItems="center">
            <Text fontSize="sm" color="gray.500">Power</Text>
            <Text fontSize="lg" fontWeight="semibold">
              {powerKw} kW
            </Text>
          </VStack>
          <VStack alignItems="center">
            <Text fontSize="sm" color="gray.500">Voltage</Text>
            <Text fontSize="lg" fontWeight="semibold">
              {voltage} V
            </Text>
          </VStack>
          <VStack alignItems="center">
            <Text fontSize="sm" color="gray.500">Current</Text>
            <Text fontSize="lg" fontWeight="semibold">
              {current} A
            </Text>
          </VStack>
        </HStack>
      </VStack>
    </Box>
  );
}
```

### **Session History Table**
```typescript
import { Table, Thead, Tbody, Tr, Th, Td, Badge } from 'native-base';

export function SessionHistoryTable({ sessions }: { sessions: ChargingSession[] }) {
  return (
    <Table>
      <Thead>
        <Tr>
          <Th>Date</Th>
          <Th>Duration</Th>
          <Th>Energy</Th>
          <Th>Status</Th>
        </Tr>
      </Thead>
      <Tbody>
        {sessions.map((session) => (
          <Tr key={session.id}>
            <Td>{new Date(session.start_time).toLocaleDateString()}</Td>
            <Td>{calculateDuration(session.start_time, session.end_time)}</Td>
            <Td>{session.end_meter - session.start_meter} kWh</Td>
            <Td>
              <Badge 
                colorScheme={session.end_time ? "green" : "blue"}
                variant="subtle"
              >
                {session.end_time ? "Completed" : "Active"}
              </Badge>
            </Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
}
```

## Implementation Strategy

### **Phase 1: Core Components**
1. Basic UI components (Button, Card, Input)
2. Charging status display
3. Session history list
4. Basic navigation

### **Phase 2: Advanced Features**
1. Real-time updates
2. Charts and graphs
3. Advanced forms
4. Push notifications

### **Phase 3: Optimization**
1. Performance optimization
2. Offline support
3. Advanced animations
4. Accessibility improvements

## Package.json Dependencies

```json
{
  "dependencies": {
    "@tanstack/react-query": "^5.0.0",
    "zustand": "^4.4.0",
    "native-base": "^3.4.0",
    "react-hook-form": "^7.45.0",
    "react-native-svg": "^13.14.0",
    "react-native-chart-kit": "^6.12.0",
    "react-native-vector-icons": "^10.0.0",
    "expo-notifications": "~0.20.0",
    "expo-location": "~16.0.0",
    "expo-camera": "~13.4.0"
  }
}
```
