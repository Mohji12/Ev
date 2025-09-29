import React from 'react';
import { Clock, Battery, Zap, Calendar, Activity, TrendingUp, CheckCircle, XCircle } from 'lucide-react';
import { ChargingSession } from '../types';

interface SessionListProps {
  sessions: ChargingSession[];
  isLoading?: boolean;
  onSessionSelect?: (session: ChargingSession) => void;
}

const SessionList: React.FC<SessionListProps> = ({ sessions, isLoading, onSessionSelect }) => {
  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatDuration = (startTime: string, endTime?: string) => {
    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : new Date();
    const duration = end.getTime() - start.getTime();
    
    if (duration <= 0) {
      return '0h 0m';
    }
    
    const hours = Math.floor(duration / (1000 * 60 * 60));
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  };

  const getSessionStatus = (session: ChargingSession) => {
    return session.end_time ? 'completed' : 'active';
  };

  const getStatusIcon = (status: string) => {
    return status === 'completed' ? (
      <CheckCircle className="w-4 h-4 text-success-600" />
    ) : (
      <Activity className="w-4 h-4 text-primary-600 animate-pulse" />
    );
  };

  const getStatusColor = (status: string) => {
    return status === 'completed' ? 'status-completed' : 'status-active';
  };

  if (isLoading) {
    return (
      <div className="card-modern animate-fade-in">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse"></div>
          <div className="h-6 bg-gray-200 rounded w-1/3 animate-pulse"></div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-6 border border-gray-200 rounded-2xl animate-pulse">
              <div className="flex justify-between items-start mb-4">
                <div className="h-5 bg-gray-200 rounded w-1/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/6"></div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="card-modern-mobile sm:card-modern animate-slide-in">
      {/* Mobile-First Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:items-center sm:justify-between mb-6 sm:mb-8">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl shadow-lg">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900">Charging Sessions</h3>
            <p className="text-sm text-gray-600">{sessions.length} sessions found</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 px-3 py-1 bg-primary-50 border border-primary-200 rounded-full self-start sm:self-auto">
          <TrendingUp className="w-4 h-4 text-primary-600" />
          <span className="text-sm font-medium text-primary-700">History</span>
        </div>
      </div>

      {sessions.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-gray-400" />
          </div>
          <h4 className="text-lg font-semibold text-gray-900 mb-2">No Sessions Found</h4>
          <p className="text-gray-600">Start a charging session to see data here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sessions.map((session) => {
            const status = getSessionStatus(session);
            return (
              <div
                key={session.id}
                className="group relative p-4 sm:p-6 bg-gradient-to-r from-white/80 to-white/60 backdrop-blur-sm border border-gray-200/50 hover:border-primary-200 rounded-2xl hover:shadow-lg transition-all duration-300 cursor-pointer touch-target haptic-light card-mobile"
                onClick={() => onSessionSelect?.(session)}
              >
                {/* Mobile-First Session Header */}
                <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:items-center sm:justify-between mb-4 sm:mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl">
                      <span className="text-sm font-bold text-gray-700">#{session.id}</span>
                    </div>
                    <div>
                      <h4 className="text-base sm:text-lg font-semibold text-gray-900">Session #{session.id}</h4>
                      <p className="text-sm text-gray-600">Connector {session.connector_id}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 self-start sm:self-auto">
                    {getStatusIcon(status)}
                    <span className={`status-indicator ${getStatusColor(status)} status-mobile`}>
                      {status}
                    </span>
                  </div>
                </div>

                {/* Mobile-First Metrics Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                  {/* Duration Card */}
                  <div className="p-3 sm:p-4 bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl border border-primary-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <Clock className="w-4 h-4 text-primary-600" />
                      <span className="text-xs font-semibold text-primary-700 uppercase tracking-wide">Duration</span>
                    </div>
                    <div className="text-xl sm:text-2xl font-bold text-primary-900">
                      {formatDuration(session.start_time, session.end_time)}
                    </div>
                  </div>

                  {/* SoC Range Card */}
                  <div className="p-3 sm:p-4 bg-gradient-to-br from-success-50 to-success-100 rounded-xl border border-success-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <Battery className="w-4 h-4 text-success-600" />
                      <span className="text-xs font-semibold text-success-700 uppercase tracking-wide">SoC Range</span>
                    </div>
                    <div className="text-xl sm:text-2xl font-bold text-success-900">
                      {session.start_soc && session.start_soc > 0 ? `${session.start_soc}%` : 'N/A'} → {session.end_soc && session.end_soc > 0 ? `${session.end_soc}%` : 'N/A'}
                    </div>
                  </div>

                  {/* Energy Card */}
                  <div className="p-3 sm:p-4 bg-gradient-to-br from-warning-50 to-warning-100 rounded-xl border border-warning-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <Zap className="w-4 h-4 text-warning-600" />
                      <span className="text-xs font-semibold text-warning-700 uppercase tracking-wide">Energy</span>
                    </div>
                    <div className="text-xl sm:text-2xl font-bold text-warning-900">
                      {session.start_meter} → {session.end_meter || 'N/A'} kWh
                    </div>
                  </div>
                </div>

                {/* Mobile-First Session Footer */}
                <div className="mt-4 sm:mt-6 pt-4 border-t border-gray-200/50">
                  <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:justify-between sm:items-center text-sm">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span className="text-xs sm:text-sm">Started: {formatDateTime(session.start_time)}</span>
                    </div>
                    {session.end_time && (
                      <div className="flex items-center space-x-2 text-gray-600">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-xs sm:text-sm">Ended: {formatDateTime(session.end_time)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Modern Hover Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SessionList;