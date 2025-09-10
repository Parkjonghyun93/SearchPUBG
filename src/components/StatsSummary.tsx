'use client';

import { MatchData, PlayerStats } from '@/types/pubg';
import DamageChart from './DamageChart';

interface StatsSummaryProps {
  matches: MatchData[];
}

export default function StatsSummary({ matches }: StatsSummaryProps) {
  const calculateStats = (): PlayerStats => {
    if (matches.length === 0) {
      return {
        totalKills: 0,
        totalDamage: 0,
        totalDeaths: 0,
        totalAssists: 0,
        averageKills: 0,
        averageDamage: 0,
        averageDeaths: 0,
        averageAssists: 0,
        totalMatches: 0
      };
    }

    const totalKills = matches.reduce((sum, match) => sum + match.stats.kills, 0);
    const totalDamage = matches.reduce((sum, match) => sum + match.stats.damage, 0);
    const totalDeaths = matches.reduce((sum, match) => sum + match.stats.deaths, 0);
    const totalAssists = matches.reduce((sum, match) => sum + match.stats.assists, 0);

    return {
      totalKills,
      totalDamage,
      totalDeaths,
      totalAssists,
      averageKills: Math.round((totalKills / matches.length) * 100) / 100,
      averageDamage: Math.round((totalDamage / matches.length) * 100) / 100,
      averageDeaths: Math.round((totalDeaths / matches.length) * 100) / 100,
      averageAssists: Math.round((totalAssists / matches.length) * 100) / 100,
      totalMatches: matches.length
    };
  };

  const stats = calculateStats();

  const StatCard = ({ 
    title, 
    total, 
    average, 
    color, 
    icon 
  }: { 
    title: string; 
    total: number; 
    average: number; 
    color: string;
    icon: string;
  }) => (
    <div className="group relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6 rounded-2xl border border-orange-400/20 hover:border-orange-400/50 transition-all duration-300 hover:shadow-2xl hover:shadow-orange-500/10 transform hover:scale-[1.02]">
      {/* 배경 그라데이션 효과 */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-yellow-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-xl shadow-lg group-hover:shadow-orange-500/30 transition-shadow duration-300">
              <span className="text-2xl filter drop-shadow-sm">{icon}</span>
            </div>
            <h3 className="text-xl font-bold text-orange-400 group-hover:text-orange-300 transition-colors">{title}</h3>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-400 text-sm font-medium">총 합계</span>
            <div className="text-right">
              <div className={`text-3xl font-bold ${color} transition-all duration-300`}>
                {total.toLocaleString()}
              </div>
              <div className="h-1 bg-gradient-to-r from-orange-400 to-yellow-400 rounded-full mt-1 opacity-60"></div>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-400 text-sm font-medium">평균</span>
            <div className={`text-2xl font-semibold ${color} transition-all duration-300`}>
              {average.toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const getRankColor = (placement: number) => {
    if (placement === 1) return 'text-yellow-400';
    if (placement <= 10) return 'text-orange-400';
    if (placement <= 50) return 'text-blue-400';
    return 'text-gray-400';
  };

  const bestMatch = matches.length > 0 
    ? matches.reduce((best, current) => 
        current.stats.kills > best.stats.kills ? current : best
      ) 
    : null;

  const averagePlacement = matches.length > 0
    ? Math.round(matches.reduce((sum, match) => sum + match.stats.placement, 0) / matches.length)
    : 0;

  return (
    <div className="mb-12">
      <div className="mb-8 p-8 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-3xl border border-orange-400/30 shadow-2xl backdrop-blur-sm relative overflow-hidden">
        {/* 배경 장식 */}
        <div className="absolute -inset-4 bg-gradient-to-r from-orange-600/5 to-yellow-600/5 rounded-[2.5rem] blur-2xl"></div>
        
        <div className="relative z-10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-4 mb-4">
              <div className="p-4 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-2xl shadow-xl">
                <svg className="w-8 h-8 text-black" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-4xl font-bold text-transparent bg-gradient-to-r from-orange-400 via-yellow-400 to-orange-500 bg-clip-text mb-2">
                  통계 요약
                </h2>
                <p className="text-gray-400 text-lg">선택된 매치들의 상세 분석 결과</p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row justify-center items-center gap-6 text-lg">
              <div className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl border border-blue-400/30">
                <span className="text-2xl">🎯</span>
                <span className="text-gray-300">
                  선택된 매치: <span className="text-blue-300 font-bold text-xl">{stats.totalMatches}</span>개
                </span>
              </div>
              <div className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl border border-purple-400/30">
                <span className="text-2xl">🏆</span>
                <span className="text-gray-300">
                  평균 순위: <span className={`font-bold text-xl ${getRankColor(averagePlacement)}`}>#{averagePlacement}</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <StatCard
            title="킬"
            total={stats.totalKills}
            average={stats.averageKills}
            color="text-red-400"
            icon="🔫"
          />
          <StatCard
            title="데미지"
            total={stats.totalDamage}
            average={stats.averageDamage}
            color="text-orange-400"
            icon="💥"
          />
          <StatCard
            title="데스"
            total={stats.totalDeaths}
            average={stats.averageDeaths}
            color="text-purple-400"
            icon="💀"
          />
          <StatCard
            title="어시스트"
            total={stats.totalAssists}
            average={stats.averageAssists}
            color="text-green-400"
            icon="🤝"
          />
        </div>

        {bestMatch && (
          <div className="bg-gradient-to-r from-yellow-900/30 to-orange-900/30 p-4 rounded-lg border border-yellow-500/30">
            <h3 className="text-lg font-semibold text-yellow-400 mb-3 flex items-center gap-2">
              <span>🏆</span> 최고 기록
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-red-400">{bestMatch.stats.kills}</div>
                <div className="text-xs text-gray-400">킬</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-400">{bestMatch.stats.damage.toLocaleString()}</div>
                <div className="text-xs text-gray-400">데미지</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-400">#{bestMatch.stats.placement}</div>
                <div className="text-xs text-gray-400">순위</div>
              </div>
              <div>
                <div className="text-sm text-gray-300">{bestMatch.gameMode}</div>
                <div className="text-xs text-gray-400">{bestMatch.mapName}</div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <DamageChart matches={matches} />
    </div>
  );
}