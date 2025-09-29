import React, { useState } from 'react';
import { Zap, Wifi, WifiOff, RefreshCw, Activity, Battery, Menu, X } from 'lucide-react';

interface HeaderProps {
  isConnected: boolean;
  evId: string;
  onRefresh?: () => void;
}

const Header: React.FC<HeaderProps> = ({ isConnected, evId, onRefresh }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Debug connection status
  console.log('[Header] Connection status:', isConnected);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="relative safe-area-top">
      {/* Modern Glass Header */}
      <div className="absolute inset-0 bg-white/80 backdrop-blur-xl border-b border-white/20"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Desktop Header */}
        <div className="hidden md:flex justify-between items-center h-20">
          {/* Modern Logo Section */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl shadow-lg">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-success-500 rounded-full border-2 border-white animate-pulse"></div>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                EV Charging Dashboard
              </h1>
              <p className="text-sm text-gray-600 font-medium">Real-time monitoring & control</p>
            </div>
          </div>

          {/* Modern Status Section */}
          <div className="flex items-center space-x-6">
            {/* Connection Status */}
            <div 
              className="connection-status"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: '12px',
                backgroundColor: isConnected ? '#f0fdf4' : '#fef2f2',
                color: isConnected ? '#15803d' : '#b91c1c',
                border: `1px solid ${isConnected ? '#bbf7d0' : '#fecaca'}`,
                fontSize: '14px',
                fontWeight: '500',
                minWidth: '120px',
                justifyContent: 'center'
              }}
            >
              {isConnected ? (
                <>
                  <div className="relative">
                    <Wifi className="w-4 h-4" style={{ color: '#15803d' }} />
                    <div className="absolute inset-0 w-4 h-4 bg-green-500 rounded-full animate-ping opacity-20"></div>
                  </div>
                  <span style={{ color: '#15803d', fontWeight: '600' }}>Connected</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-4 h-4" style={{ color: '#b91c1c' }} />
                  <span style={{ color: '#b91c1c', fontWeight: '600' }}>Disconnected</span>
                </>
              )}
            </div>
            
            {/* EV ID Badge */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-xl border border-white/30 shadow-sm">
                <Battery className="w-4 h-4 text-primary-600" />
                <span className="text-sm font-medium text-gray-700">EV ID:</span>
                <span className="text-sm font-bold text-primary-700 bg-primary-50 px-2 py-1 rounded-lg">
                  {evId}
                </span>
              </div>
            </div>
            
            {/* Modern Refresh Button */}
            {onRefresh && (
              <button
                onClick={onRefresh}
                className="group flex items-center space-x-2 px-4 py-2 bg-white/60 backdrop-blur-sm hover:bg-white/80 border border-white/30 hover:border-white/50 rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
              >
                <RefreshCw className="w-4 h-4 text-gray-600 group-hover:text-primary-600 transition-colors" />
                <span className="text-sm font-medium text-gray-700 group-hover:text-primary-700 transition-colors">
                  Refresh
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Header */}
        <div className="md:hidden">
          <div className="flex justify-between items-center h-16 px-mobile">
            {/* Mobile Logo */}
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl shadow-lg">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-success-500 rounded-full border-2 border-white animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">EV Dashboard</h1>
                <p className="text-xs text-gray-600">Real-time monitoring</p>
              </div>
            </div>

            {/* Mobile Status Section */}
            <div className="flex items-center space-x-3">
              {/* Mobile Connection Status */}
              <div 
                className="connection-status"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  backgroundColor: isConnected ? '#f0fdf4' : '#fef2f2',
                  color: isConnected ? '#15803d' : '#b91c1c',
                  border: `1px solid ${isConnected ? '#bbf7d0' : '#fecaca'}`,
                  fontSize: '12px',
                  fontWeight: '500',
                  minWidth: '80px',
                  justifyContent: 'center'
                }}
              >
                {isConnected ? (
                  <>
                    <Wifi className="w-3 h-3" style={{ color: '#15803d' }} />
                    <span style={{ color: '#15803d', fontWeight: '600' }}>Connected</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-3 h-3" style={{ color: '#b91c1c' }} />
                    <span style={{ color: '#b91c1c', fontWeight: '600' }}>Disconnected</span>
                  </>
                )}
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={toggleMobileMenu}
                className="touch-target haptic-light flex items-center justify-center w-10 h-10 bg-white/60 backdrop-blur-sm rounded-xl border border-white/30 shadow-sm"
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5 text-gray-700" />
                ) : (
                  <Menu className="w-5 h-5 text-gray-700" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Menu Dropdown */}
          {isMobileMenuOpen && (
            <div className="absolute top-full left-0 right-0 bg-white/95 backdrop-blur-xl border-b border-white/20 shadow-lg z-50">
              <div className="px-mobile py-4 space-y-4">
                {/* Mobile Connection Status */}
                <div 
                  className={`connection-status ${isConnected ? 'connection-connected' : 'connection-disconnected'} w-full justify-center`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 16px',
                    borderRadius: '12px',
                    backgroundColor: isConnected ? '#f0fdf4' : '#fef2f2',
                    color: isConnected ? '#15803d' : '#b91c1c',
                    border: `1px solid ${isConnected ? '#bbf7d0' : '#fecaca'}`,
                    fontSize: '14px',
                    fontWeight: '500',
                    width: '100%',
                    justifyContent: 'center'
                  }}
                >
                  {isConnected ? (
                    <>
                      <div className="relative">
                        <Wifi className="w-4 h-4" />
                        <div className="absolute inset-0 w-4 h-4 bg-success-500 rounded-full animate-ping opacity-20"></div>
                      </div>
                      <span>Connected</span>
                    </>
                  ) : (
                    <>
                      <WifiOff className="w-4 h-4" />
                      <span>Disconnected</span>
                    </>
                  )}
                </div>
                
                {/* Mobile EV ID Badge */}
                <div className="flex items-center justify-center space-x-2 px-4 py-3 bg-white/60 backdrop-blur-sm rounded-xl border border-white/30 shadow-sm">
                  <Battery className="w-4 h-4 text-primary-600" />
                  <span className="text-sm font-medium text-gray-700">EV ID:</span>
                  <span className="text-sm font-bold text-primary-700 bg-primary-50 px-2 py-1 rounded-lg">
                    {evId}
                  </span>
                </div>
                
                {/* Mobile Refresh Button */}
                {onRefresh && (
                  <button
                    onClick={() => {
                      onRefresh();
                      setIsMobileMenuOpen(false);
                    }}
                    className="btn btn-primary btn-mobile touch-target haptic-medium"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh Data
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Modern Gradient Border */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary-200 to-transparent"></div>
    </header>
  );
};

export default Header;
