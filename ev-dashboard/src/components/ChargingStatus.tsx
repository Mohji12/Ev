import React from 'react';
import { Battery, Zap, Clock, Activity, TrendingUp, Gauge } from 'lucide-react';
import { ChargingStatus as ChargingStatusType } from '../types';

interface ChargingStatusProps {
  status: ChargingStatusType | null;
  isLoading?: boolean;
}

const ChargingStatus: React.FC<ChargingStatusProps> = ({ status, isLoading }) => {
  if (isLoading || !status) {
    return (
      <div className="card-modern animate-fade-in">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded-xl w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-12 bg-gray-200 rounded-xl"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            </div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-12 bg-gray-200 rounded-xl"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString();
  };

  const getStatusColor = (soc: number) => {
    if (soc >= 80) return 'text-success-600';
    if (soc >= 50) return 'text-warning-600';
    return 'text-danger-600';
  };

  const getStatusBgColor = (soc: number) => {
    if (soc >= 80) return 'bg-success-500';
    if (soc >= 50) return 'bg-warning-500';
    return 'bg-danger-500';
  };

  return (
    <div className="card-modern animate-slide-in">
      {/* Modern Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl shadow-lg">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Charging Status</h3>
            <p className="text-sm text-gray-600">Real-time monitoring</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 px-3 py-1 bg-success-50 border border-success-200 rounded-full">
          <div className="w-2 h-2 bg-success-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium text-success-700">Live</span>
        </div>
      </div>

      {/* Modern Metrics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Battery Status Card */}
        <div className="relative p-6 bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl border border-primary-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Battery className="w-5 h-5 text-primary-600" />
              <span className="text-sm font-semibold text-primary-700 uppercase tracking-wide">Battery Level</span>
            </div>
            <div className="text-xs text-primary-600 font-medium">
              {status.remaining_percent}% to full
            </div>
          </div>
          
          <div className="mb-4">
            <div className="text-4xl font-bold text-primary-900 mb-2">
              {status.current_soc}%
            </div>
            <div className="relative w-full bg-white/60 rounded-full h-3 shadow-inner">
              <div 
                className={`h-3 rounded-full transition-all duration-1000 ease-out ${getStatusBgColor(status.current_soc)} shadow-lg`}
                style={{ width: `${status.current_soc}%` }}
              >
                <div className="h-full bg-gradient-to-r from-white/20 to-transparent rounded-full"></div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-primary-700">
            <TrendingUp className="w-4 h-4" />
            <span>Charging in progress</span>
          </div>
        </div>

        {/* Power Information Card */}
        <div className="relative p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Zap className="w-5 h-5 text-gray-600" />
              <span className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Power Output</span>
            </div>
            <div className="text-xs text-gray-600 font-medium">
              Active charging
            </div>
          </div>
          
          <div className="mb-6">
            <div className="text-4xl font-bold text-gray-900 mb-2">
              {status.power_kw || 0} kW
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Gauge className="w-4 h-4" />
              <span>Current power draw</span>
            </div>
          </div>
          
          {/* Power Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-white/60 rounded-xl border border-gray-200">
              <div className="text-xs text-gray-600 font-medium mb-1">Voltage</div>
              <div className="text-lg font-bold text-gray-900">{status.voltage || 0} V</div>
            </div>
            <div className="p-3 bg-white/60 rounded-xl border border-gray-200">
              <div className="text-xs text-gray-600 font-medium mb-1">Current</div>
              <div className="text-lg font-bold text-gray-900">{status.current || 0} A</div>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Session Info */}
      <div className="mt-8 p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl border border-gray-200">
        <div className="flex items-center space-x-2 mb-4">
          <Clock className="w-5 h-5 text-gray-600" />
          <span className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Session Information</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <div className="text-xs text-gray-600 font-medium">Session Started</div>
            <div className="text-lg font-bold text-gray-900">{formatTime(status.start_time)}</div>
          </div>
          <div className="space-y-2">
            <div className="text-xs text-gray-600 font-medium">Current Time</div>
            <div className="text-lg font-bold text-gray-900">{formatTime(status.current_time)}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChargingStatus;