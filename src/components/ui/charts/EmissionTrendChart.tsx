import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

type DataPoint = {
  year: string;
  baseline: number;
  current: number;
};

interface EmissionTrendChartProps {
  data?: DataPoint[];
}

const defaultData: DataPoint[] = [
  { year: "2020", baseline: 5500, current: 0 },
  { year: "2021", baseline: 5650, current: 0 },
  { year: "2022", baseline: 5800, current: 0 },
  { year: "2023", baseline: 5700, current: 0 },
  { year: "2024", baseline: 5650, current: 0 },
];

export const EmissionTrendChart: React.FC<EmissionTrendChartProps> = ({
  data = defaultData,
}) => {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 10, right: 16, bottom: 0, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="year" />
        <YAxis />
        <Tooltip />
        <Line
          type="monotone"
          dataKey="baseline"
          name="Baseline"
          stroke="#ef4444"
          strokeWidth={2}
          dot={{ r: 3 }}
        />
        <Line
          type="monotone"
          dataKey="current"
          name="After Interventions"
          stroke="#22c55e"
          strokeWidth={2}
          dot={{ r: 3 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};
