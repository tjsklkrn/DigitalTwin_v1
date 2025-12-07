import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

const defaultData = [
  { sector: "Residential", baseline: 400, current: 320 },
  { sector: "Industrial", baseline: 700, current: 580 },
  { sector: "Commercial", baseline: 320, current: 300 },
  { sector: "Transport", baseline: 280, current: 260 },
];

export default function EmissionsBySourceChart() {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={defaultData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="sector" />
        <YAxis />
        <Tooltip />

        <Bar dataKey="baseline" fill="#9ca3af" />
        <Bar dataKey="current" fill="#3b82f6" />
      </BarChart>
    </ResponsiveContainer>
  );
}
