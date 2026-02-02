'use client';

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface CityPieChartProps {
  data: Array<{ city: string; count: number }>;
}

const COLORS = [
  '#06b6d4', // cyan-500
  '#0891b2', // cyan-600
  '#0e7490', // cyan-700
  '#155e75', // cyan-800
  '#164e63', // cyan-900
  '#3b82f6', // blue-500
  '#2563eb', // blue-600
  '#1d4ed8', // blue-700
  '#1e40af', // blue-800
  '#1e3a8a', // blue-900
];

export default function CityPieChart({ data }: CityPieChartProps) {
  const chartData = data.map((item) => ({
    name: item.city,
    value: item.count,
  }));

  return (
    <div className="h-full w-full rounded-lg border border-cyan-500/30 bg-gradient-to-br from-slate-900 to-slate-800 p-6 shadow-lg shadow-cyan-500/10">
      <h3 className="mb-4 text-lg font-semibold text-cyan-400">各縣市土地筆數分布</h3>
      <ResponsiveContainer width="100%" height="100%" minHeight={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(15, 23, 42, 0.95)',
              border: '1px solid rgba(6, 182, 212, 0.3)',
              borderRadius: '0.5rem',
              color: '#fff',
            }}
            itemStyle={{ color: '#06b6d4' }}
          />
          <Legend
            wrapperStyle={{ color: '#94a3b8' }}
            iconType="circle"
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
