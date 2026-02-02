'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface AreaBarChartProps {
  data: Array<{ district: string; areaM2: number }>;
}

export default function AreaBarChart({ data }: AreaBarChartProps) {
  // Sort by area descending and take top 10
  const sortedData = [...data]
    .sort((a, b) => b.areaM2 - a.areaM2)
    .slice(0, 10)
    .map((item) => ({
      district: item.district,
      area: Math.round(item.areaM2),
    }));

  const formatArea = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toString();
  };

  return (
    <div className="h-full w-full rounded-lg border border-cyan-500/30 bg-gradient-to-br from-slate-900 to-slate-800 p-6 shadow-lg shadow-cyan-500/10">
      <h3 className="mb-4 text-lg font-semibold text-cyan-400">Top 10 鄉鎮面積排行</h3>
      <ResponsiveContainer width="100%" height="100%" minHeight={400}>
        <BarChart
          data={sortedData}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(6, 182, 212, 0.1)" />
          <XAxis
            type="number"
            tickFormatter={formatArea}
            stroke="#94a3b8"
            style={{ fontSize: '0.875rem' }}
          />
          <YAxis
            dataKey="district"
            type="category"
            stroke="#94a3b8"
            style={{ fontSize: '0.875rem' }}
            width={90}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(15, 23, 42, 0.95)',
              border: '1px solid rgba(6, 182, 212, 0.3)',
              borderRadius: '0.5rem',
              color: '#fff',
            }}
            itemStyle={{ color: '#06b6d4' }}
            formatter={(value) => [`${Number(value).toLocaleString()} m²`, '面積']}
          />
          <Bar
            dataKey="area"
            fill="#06b6d4"
            radius={[0, 4, 4, 0]}
            background={{ fill: 'rgba(6, 182, 212, 0.05)' }}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
