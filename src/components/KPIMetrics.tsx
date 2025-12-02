import React from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingDown, TrendingUp, Activity, Target } from 'lucide-react';

interface KPIData {
  totalEmissions: number;
  emissionReduction: number;
  interventionEfficiency: number;
  costEffectiveness: number;
  projectedSavings: number;
  hotspotCount: number;
}

interface KPIMetricsProps {
  currentKPI: KPIData;
  baselineKPI: KPIData;
  historicalData: Array<{
    year: number;
    emissions: number;
    interventions: number;
  }>;
  emissionsByType: Array<{
    type: string;
    current: number;
    baseline: number;
  }>;
}

export function KPIMetrics({ currentKPI, baselineKPI, historicalData, emissionsByType }: KPIMetricsProps) {
  const getChangeIcon = (current: number, baseline: number) => {
    return current < baseline ? (
      <TrendingDown className="w-4 h-4 text-green-500" />
    ) : (
      <TrendingUp className="w-4 h-4 text-red-500" />
    );
  };

  const getChangeColor = (current: number, baseline: number) => {
    return current < baseline ? 'text-green-600' : 'text-red-600';
  };

  const getPercentChange = (current: number, baseline: number) => {
    const change = ((current - baseline) / baseline) * 100;
    return Math.abs(change).toFixed(1);
  };

  return (
    <div className="space-y-4">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Total Emissions</span>
            {getChangeIcon(currentKPI.totalEmissions, baselineKPI.totalEmissions)}
          </div>
          <div className="text-2xl">{currentKPI.totalEmissions.toFixed(1)}</div>
          <div className="text-xs text-gray-500">tons CO₂/year</div>
          <div className={`text-xs mt-1 ${getChangeColor(currentKPI.totalEmissions, baselineKPI.totalEmissions)}`}>
            {getPercentChange(currentKPI.totalEmissions, baselineKPI.totalEmissions)}% vs baseline
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Reduction</span>
            <Target className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl text-green-600">{currentKPI.emissionReduction.toFixed(1)}%</div>
          <div className="text-xs text-gray-500">from interventions</div>
          <Badge variant="secondary" className="text-xs mt-1">
            {currentKPI.projectedSavings.toFixed(0)} tons saved
          </Badge>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Efficiency</span>
            <Activity className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl">{currentKPI.interventionEfficiency.toFixed(1)}%</div>
          <div className="text-xs text-gray-500">intervention effectiveness</div>
          <div className="text-xs mt-1 text-gray-600">
            {currentKPI.hotspotCount} hotspots remaining
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Cost/Benefit</span>
            <span className="text-lg">💰</span>
          </div>
          <div className="text-2xl">${currentKPI.costEffectiveness.toFixed(0)}</div>
          <div className="text-xs text-gray-500">per ton CO₂ reduced</div>
          <div className="text-xs mt-1 text-green-600">
            ROI: {((1/currentKPI.costEffectiveness) * 100).toFixed(0)}%
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-4">
          <h4 className="text-md mb-4">Emissions Trend</h4>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={historicalData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="emissions" 
                stroke="#ef4444" 
                strokeWidth={2}
                name="CO₂ Emissions"
              />
              <Line 
                type="monotone" 
                dataKey="interventions" 
                stroke="#22c55e" 
                strokeWidth={2}
                name="Interventions"
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-4">
          <h4 className="text-md mb-4">Emissions by Source</h4>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={emissionsByType}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="type" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="baseline" fill="#94a3b8" name="Baseline" />
              <Bar dataKey="current" fill="#3b82f6" name="Current" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Summary */}
      <Card className="p-4">
        <h4 className="text-md mb-3">Scenario Summary</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="p-3 bg-green-50 rounded-lg">
            <div className="text-green-800">✅ Achievements</div>
            <ul className="mt-2 space-y-1 text-green-700">
              <li>• {currentKPI.emissionReduction.toFixed(1)}% emission reduction</li>
              <li>• {currentKPI.projectedSavings.toFixed(0)} tons CO₂ saved annually</li>
              <li>• {(baselineKPI.hotspotCount - currentKPI.hotspotCount)} hotspots mitigated</li>
            </ul>
          </div>
          
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="text-blue-800">📊 Current Status</div>
            <ul className="mt-2 space-y-1 text-blue-700">
              <li>• Total: {currentKPI.totalEmissions.toFixed(1)} tons/year</li>
              <li>• Efficiency: {currentKPI.interventionEfficiency.toFixed(1)}%</li>
              <li>• Cost: ${currentKPI.costEffectiveness}/ton</li>
            </ul>
          </div>
          
          <div className="p-3 bg-orange-50 rounded-lg">
            <div className="text-orange-800">🎯 Recommendations</div>
            <ul className="mt-2 space-y-1 text-orange-700">
              <li>• Focus on high-emission areas</li>
              <li>• Deploy vertical gardens in residential zones</li>
              <li>• Consider capture units for industrial areas</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}