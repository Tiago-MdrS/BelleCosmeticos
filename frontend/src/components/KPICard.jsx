import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export function KPICard({ title, value, subtitle, icon: Icon, trend, alert }) {
  const isPositive = trend >= 0;

  return (
    <div className="bg-white border border-pink-100 rounded-xl p-6 shadow-sm">
      
      {/* Top */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-medium text-slate-600">
          {title}
        </p>

        <div
          className={`p-2 rounded-lg ${
            alert ? 'bg-yellow-500/10' : 'bg-pink-400'
          }`}
        >
          <Icon className={`w-5 h-5 ${alert ? 'text-yellow-500' : 'text-white'}`} />
        </div>
      </div>

      {/* Value */}
      <h3 className="text-2xl font-bold mb-1 text-gray-900">
        {value}
      </h3>

      {/* Bottom */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-500">
          {subtitle}
        </p>

        {trend !== undefined && (
          <div
            className={`flex items-center gap-1 text-xs font-semibold ${
              isPositive ? 'text-green-500' : 'text-red-500'
            }`}
          >
            {isPositive ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
    </div>
  );
}