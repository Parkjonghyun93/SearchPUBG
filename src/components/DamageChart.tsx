'use client';

import { MatchData } from '@/types/pubg';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DamageChartProps {
  matches: MatchData[];
}

export default function DamageChart({ matches }: DamageChartProps) {
  
  const sortedMatches = matches
    .map(match => ({ ...match, sortDate: new Date(match.createdAt).getTime() }))
    .sort((a, b) => a.sortDate - b.sortDate);
  
  const chartData = sortedMatches.map((match, index) => ({
    date: new Date(match.createdAt).toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric'
    }),
    match: `매치 ${index + 1}`,
    damage: match.stats.damage,
    fullDate: new Date(match.createdAt).toISOString()
  }));

  const CustomTooltip = ({ active, payload, label }: { 
    active?: boolean; 
    payload?: Array<{ value: number }>; 
    label?: string; 
  }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900/95 border border-orange-400/30 rounded-lg p-3 shadow-xl backdrop-blur-sm">
          <p className="text-orange-300 font-semibold">{label}</p>
          <p className="text-yellow-300 font-bold">
            {`딜량: ${payload[0].value.toLocaleString()}`}
          </p>
        </div>
      );
    }
    return null;
  };

  if (matches.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        그래프를 표시할 데이터가 없습니다.
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6 rounded-2xl border border-orange-400/20 shadow-2xl">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-xl shadow-lg">
            <span className="text-2xl">📊</span>
          </div>
          <h3 className="text-2xl font-bold text-transparent bg-gradient-to-r from-orange-400 to-yellow-400 bg-clip-text">
            딜량 추이 그래프 (매치별)
          </h3>
        </div>
        <p className="text-gray-400 text-sm">시간순으로 정렬된 매치별 딜량 변화</p>
      </div>
      
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="match" 
              stroke="#9CA3AF"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="#9CA3AF"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => value.toLocaleString()}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey="damage" 
              stroke="url(#colorGradient)"
              strokeWidth={3}
              dot={{ 
                fill: '#F59E0B', 
                strokeWidth: 2, 
                stroke: '#FCD34D',
                r: 5 
              }}
              activeDot={{ 
                r: 8, 
                fill: '#F59E0B',
                stroke: '#FCD34D',
                strokeWidth: 2
              }}
            />
            <defs>
              <linearGradient id="colorGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#F59E0B" />
                <stop offset="100%" stopColor="#FCD34D" />
              </linearGradient>
            </defs>
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 text-center text-sm text-gray-400">
        총 {matches.length}개 매치 • 평균 딜량: {Math.round(chartData.reduce((sum, item) => sum + item.damage, 0) / chartData.length).toLocaleString()}
      </div>
    </div>
  );
}