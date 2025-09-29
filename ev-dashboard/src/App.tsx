import React, { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { chargingApi } from './services/api';
import { useWebSocket } from './hooks/useWebSocket';
import { ChargingStatus, ChargingSession, MeterValue } from './types';
import Header from './components/Header';
import ChargingStatusComponent from './components/ChargingStatus';
import SessionList from './components/SessionList';
import RealTimeChart from './components/RealTimeChart';

const App: React.FC = () => {
  const [evId, setEvId] = useState('EV001'); // Default EV ID
  const [chargingStatus, setChargingStatus] = useState<ChargingStatus | null>(null);
  const [sessions, setSessions] = useState<ChargingSession[]>([]);
  const [meterValues, setMeterValues] = useState<MeterValue[]>([]);
  const [selectedSession, setSelectedSession] = useState<ChargingSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // WebSocket connection
  const { isConnected, lastMessage } = useWebSocket(evId);
  
  // Debug WebSocket connection status
  useEffect(() => {
    console.log(`[App] WebSocket connection status: ${isConnected ? '✅ Connected' : '❌ Disconnected'}`);
  }, [isConnected]);

  // Temporary test - force connection status to true for testing
  const testConnected = true; // Change this to false to test disconnected state

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, [evId]);

  // Handle WebSocket messages
  useEffect(() => {
    if (lastMessage) {
      console.log('WebSocket message received:', lastMessage);
      // Refresh data when receiving real-time updates
      loadChargingStatus();
    }
  }, [lastMessage]);

  const loadInitialData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      await Promise.all([
        loadChargingStatus(),
        loadSessions(),
      ]);
    } catch (err) {
      setError('Failed to load data. Please check if the backend is running.');
      console.error('Error loading initial data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadChargingStatus = async () => {
    try {
      const status = await chargingApi.getCurrentStatus(evId);
      setChargingStatus(status);
    } catch (err) {
      console.error('Error loading charging status:', err);
      setChargingStatus(null);
    }
  };

  const loadSessions = async () => {
    try {
      const sessionData = await chargingApi.getSessions(evId);
      setSessions(sessionData);
    } catch (err) {
      console.error('Error loading sessions:', err);
    }
  };

  const loadMeterValues = async (sessionId: number) => {
    try {
      console.log(`Loading meter values for session ${sessionId}`);
      const meterData = await chargingApi.getMeterValues(sessionId);
      console.log(`Loaded ${meterData.length} meter values:`, meterData);
      setMeterValues(meterData);
    } catch (err) {
      console.error('Error loading meter values:', err);
    }
  };

  const handleSessionSelect = (session: ChargingSession) => {
    setSelectedSession(session);
    loadMeterValues(session.id);
  };

  // Auto-select the first session if available
  useEffect(() => {
    if (sessions.length > 0 && !selectedSession) {
      const firstSession = sessions[0];
      setSelectedSession(firstSession);
      loadMeterValues(firstSession.id);
    }
  }, [sessions, selectedSession]);

  const handleRefresh = () => {
    console.log('Force refreshing all data...');
    setSessions([]);
    setMeterValues([]);
    setSelectedSession(null);
    setChargingStatus(null);
    loadInitialData();
  };

  const handleEvIdChange = (newEvId: string) => {
    setEvId(newEvId);
    setSelectedSession(null);
    setMeterValues([]);
    // Load data for the new EV ID
    loadInitialData();
  };

  return (
    <div className="min-h-screen safe-area-bottom">
        <Header isConnected={testConnected} evId={evId} onRefresh={handleRefresh} />
      
      <main className="max-w-7xl mx-auto px-mobile sm:px-6 lg:px-8 py-mobile sm:py-8">
        {/* Mobile-First Controls */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:gap-6 sm:items-center sm:justify-between">
            {/* Mobile Controls */}
            <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:items-center sm:space-x-6">
              <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:items-center sm:space-x-3">
                <label htmlFor="evId" className="text-sm font-semibold text-gray-700 sm:text-base">
                  EV ID
                </label>
                <input
                  id="evId"
                  type="text"
                  value={evId}
                  onChange={(e) => handleEvIdChange(e.target.value)}
                  className="form-input w-full sm:w-32 touch-target"
                  placeholder="EV001"
                />
              </div>
              <button
                onClick={handleRefresh}
                className="btn btn-primary btn-mobile sm:btn touch-target haptic-medium"
                disabled={isLoading}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                {isLoading ? 'Loading...' : 'Refresh'}
              </button>
            </div>
            
            {error && (
              <div className="p-4 bg-danger-50 border border-danger-200 rounded-xl">
                <p className="text-sm text-danger-800 font-medium text-center sm:text-left">{error}</p>
              </div>
            )}
          </div>
        </div>

        {/* Mobile-First Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Left Column - Mobile Optimized */}
          <div className="space-y-6 sm:space-y-8">
            {chargingStatus ? (
              <ChargingStatusComponent 
                status={chargingStatus} 
                isLoading={isLoading && !chargingStatus}
              />
            ) : (
              <div className="card-modern-mobile sm:card-modern animate-fade-in">
                <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:items-center sm:justify-between mb-6 sm:mb-8">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-gray-500 to-gray-600 rounded-xl shadow-lg">
                      <div className="w-5 h-5 text-white">⚡</div>
                    </div>
                    <div>
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900">Charging Status</h3>
                      <p className="text-sm text-gray-600">No active session</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 px-3 py-1 bg-gray-50 border border-gray-200 rounded-full self-start sm:self-auto">
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-700">Inactive</span>
                  </div>
                </div>
                
                {sessions.length > 0 ? (
                  <div className="space-y-6">
                    <div className="text-center py-6 sm:py-8">
                      <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <div className="w-8 h-8 text-gray-400">🔋</div>
                      </div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">No Active Session</h4>
                      <p className="text-gray-600 text-sm sm:text-base">Start a charging session to see real-time data</p>
                    </div>
                    
                    {/* Mobile Last Session Info */}
                    <div className="p-4 sm:p-6 bg-gradient-to-r from-primary-50 to-primary-100 rounded-2xl border border-primary-200">
                      <h4 className="text-sm font-semibold text-primary-700 uppercase tracking-wide mb-4">Last Session</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="text-xs text-primary-600 font-medium">Session ID</div>
                          <div className="text-lg font-bold text-primary-900">#{sessions[0].id}</div>
                        </div>
                        <div className="space-y-2">
                          <div className="text-xs text-primary-600 font-medium">Start Time</div>
                          <div className="text-lg font-bold text-primary-900">{new Date(sessions[0].start_time).toLocaleTimeString()}</div>
                        </div>
                        <div className="space-y-2">
                          <div className="text-xs text-primary-600 font-medium">End Time</div>
                          <div className="text-lg font-bold text-primary-900">{sessions[0].end_time ? new Date(sessions[0].end_time).toLocaleTimeString() : 'N/A'}</div>
                        </div>
                        <div className="space-y-2">
                          <div className="text-xs text-primary-600 font-medium">SoC Range</div>
                          <div className="text-lg font-bold text-primary-900">
                            {sessions[0].start_soc && sessions[0].start_soc > 0 ? `${sessions[0].start_soc}%` : 'N/A'} → {sessions[0].end_soc && sessions[0].end_soc > 0 ? `${sessions[0].end_soc}%` : 'N/A'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 sm:py-12">
                    <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <div className="w-10 h-10 text-gray-400">🔋</div>
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">No Sessions Found</h4>
                    <p className="text-gray-600 text-sm sm:text-base">Start a charging session to see data</p>
                  </div>
                )}
              </div>
            )}
            
            <SessionList 
              sessions={sessions}
              isLoading={isLoading}
              onSessionSelect={handleSessionSelect}
            />
          </div>

          {/* Right Column - Mobile Optimized */}
          <div className="space-y-6 sm:space-y-8">
            <RealTimeChart 
              meterValues={meterValues}
              isLoading={isLoading && !meterValues.length}
            />
            
            {selectedSession && (
              <div className="card-modern-mobile sm:card-modern animate-slide-in">
                <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:items-center sm:space-x-3 mb-6">
                  <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl shadow-lg">
                    <div className="w-5 h-5 text-white">📊</div>
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900">Session Details</h3>
                    <p className="text-sm text-gray-600">Selected session information</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="p-4 bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl border border-primary-200">
                    <div className="text-xs text-primary-600 font-medium mb-1">Session ID</div>
                    <div className="text-xl sm:text-2xl font-bold text-primary-900">#{selectedSession.id}</div>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-success-50 to-success-100 rounded-xl border border-success-200">
                    <div className="text-xs text-success-600 font-medium mb-1">Connector</div>
                    <div className="text-xl sm:text-2xl font-bold text-success-900">{selectedSession.connector_id}</div>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-warning-50 to-warning-100 rounded-xl border border-warning-200">
                    <div className="text-xs text-warning-600 font-medium mb-1">Start Time</div>
                    <div className="text-sm sm:text-lg font-bold text-warning-900">
                      {new Date(selectedSession.start_time).toLocaleString()}
                    </div>
                  </div>
                  {selectedSession.end_time && (
                    <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                      <div className="text-xs text-gray-600 font-medium mb-1">End Time</div>
                      <div className="text-sm sm:text-lg font-bold text-gray-900">
                        {new Date(selectedSession.end_time).toLocaleString()}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
