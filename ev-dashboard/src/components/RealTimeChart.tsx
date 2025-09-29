import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { TrendingUp, Activity, Zap, Battery, Gauge } from 'lucide-react';
import { MeterValue } from '../types';

interface RealTimeChartProps {
  meterValues: MeterValue[];
  isLoading?: boolean;
}

const RealTimeChart: React.FC<RealTimeChartProps> = ({ meterValues, isLoading }) => {
  if (isLoading) {
    return (
      <div className="card-modern animate-fade-in">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse"></div>
          <div className="h-6 bg-gray-200 rounded w-1/3 animate-pulse"></div>
        </div>
        <div className="h-80 bg-gray-100 rounded-2xl animate-pulse"></div>
      </div>
    );
  }

  if (meterValues.length === 0) {
    return (
      <div className="card-modern animate-slide-in">
        {/* Modern Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl shadow-lg">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Real-time Data</h3>
              <p className="text-sm text-gray-600">Live charging metrics</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 px-3 py-1 bg-gray-50 border border-gray-200 rounded-full">
            <Activity className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">No Data</span>
          </div>
        </div>

        {/* Empty State */}
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <TrendingUp className="w-10 h-10 text-gray-400" />
          </div>
          <h4 className="text-lg font-semibold text-gray-900 mb-2">No Data Available</h4>
          <p className="text-gray-600 mb-6">Start a charging session to see real-time data</p>
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-primary-50 border border-primary-200 rounded-xl">
            <Activity className="w-4 h-4 text-primary-600" />
            <span className="text-sm font-medium text-primary-700">Waiting for data...</span>
          </div>
        </div>
      </div>
    );
  }

  // Transform data for the chart
  const chartData = meterValues.map((value) => ({
    time: new Date(value.timestamp).toLocaleTimeString(),
    timestamp: value.timestamp,
    soc: value.soc || 0,
    power: value.power_kw || 0,
    voltage: value.voltage || 0,
    current: value.current || 0,
  }));

  const formatTooltipValue = (value: number, name: string) => {
    switch (name) {
      case 'soc':
        return [`${value}%`, 'SoC'];
      case 'power':
        return [`${value} kW`, 'Power'];
      case 'voltage':
        return [`${value} V`, 'Voltage'];
      case 'current':
        return [`${value} A`, 'Current'];
      default:
        return [value, name];
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl p-4 shadow-xl">
          <p className="text-sm font-semibold text-gray-900 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center space-x-2 text-sm">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              ></div>
              <span className="text-gray-600">{entry.name}:</span>
              <span className="font-semibold text-gray-900">{entry.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="card-modern-mobile sm:card-modern animate-slide-in">
      {/* Mobile-First Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:items-center sm:justify-between mb-6 sm:mb-8">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl shadow-lg">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900">Real-time Data</h3>
            <p className="text-sm text-gray-600">{meterValues.length} data points</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 px-3 py-1 bg-success-50 border border-success-200 rounded-full self-start sm:self-auto">
          <div className="w-2 h-2 bg-success-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium text-success-700">Live</span>
        </div>
      </div>

      {/* Mobile-Optimized Chart Container */}
      <div className="relative">
        <div className="h-64 sm:h-80 w-full chart-mobile sm:chart-desktop">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
              <defs>
                <linearGradient id="socGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05}/>
                </linearGradient>
                <linearGradient id="powerGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.05}/>
                </linearGradient>
              </defs>
              
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="time" 
                stroke="#64748b"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis 
                stroke="#64748b"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                width={40}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                iconType="circle"
              />
              
              <Area
                type="monotone"
                dataKey="soc"
                stroke="#3b82f6"
                strokeWidth={2}
                fill="url(#socGradient)"
                name="SoC (%)"
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 3 }}
                activeDot={{ r: 5, stroke: '#3b82f6', strokeWidth: 2 }}
              />
              <Area
                type="monotone"
                dataKey="power"
                stroke="#f59e0b"
                strokeWidth={2}
                fill="url(#powerGradient)"
                name="Power (kW)"
                dot={{ fill: '#f59e0b', strokeWidth: 2, r: 3 }}
                activeDot={{ r: 5, stroke: '#f59e0b', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Mobile-First Metrics Summary */}
      <div className="mt-6 sm:mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-3 sm:p-4 bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl border border-primary-200">
          <div className="flex items-center space-x-2 mb-2">
            <Battery className="w-3 h-3 sm:w-4 sm:h-4 text-primary-600" />
            <span className="text-xs font-semibold text-primary-700 uppercase tracking-wide">Avg SoC</span>
          </div>
          <div className="text-lg sm:text-2xl font-bold text-primary-900">
            {Math.round(chartData.reduce((sum, item) => sum + item.soc, 0) / chartData.length)}%
          </div>
        </div>

        <div className="p-3 sm:p-4 bg-gradient-to-br from-warning-50 to-warning-100 rounded-xl border border-warning-200">
          <div className="flex items-center space-x-2 mb-2">
            <Zap className="w-3 h-3 sm:w-4 sm:h-4 text-warning-600" />
            <span className="text-xs font-semibold text-warning-700 uppercase tracking-wide">Avg Power</span>
          </div>
          <div className="text-lg sm:text-2xl font-bold text-warning-900">
            {Math.round((chartData.reduce((sum, item) => sum + item.power, 0) / chartData.length) * 10) / 10} kW
          </div>
        </div>

        <div className="p-3 sm:p-4 bg-gradient-to-br from-success-50 to-success-100 rounded-xl border border-success-200">
          <div className="flex items-center space-x-2 mb-2">
            <Gauge className="w-3 h-3 sm:w-4 sm:h-4 text-success-600" />
            <span className="text-xs font-semibold text-success-700 uppercase tracking-wide">Max Voltage</span>
          </div>
          <div className="text-lg sm:text-2xl font-bold text-success-900">
            {Math.max(...chartData.map(item => item.voltage))} V
          </div>
        </div>

        <div className="p-3 sm:p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200">
          <div className="flex items-center space-x-2 mb-2">
            <Activity className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" />
            <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Max Current</span>
          </div>
          <div className="text-lg sm:text-2xl font-bold text-gray-900">
            {Math.max(...chartData.map(item => item.current))} A
          </div>
        </div>
      </div>
    </div>
  );
};

export default RealTimeChart;