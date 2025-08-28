'use client';

import { MatchData, TeammateStats as TeammateStatsType } from '@/types/pubg';
import { useMemo } from 'react';

interface TeammateStatsProps {
  matches: MatchData[];
  selectedMatches: string[];
  playerInfo?: { id: string; name: string; };
}

export default function TeammateStats({ matches, selectedMatches, playerInfo }: TeammateStatsProps) {
  const teammateStats = useMemo(() => {
    const selectedMatchData = matches.filter(match => selectedMatches.includes(match.id));
    const teammateMap = new Map<string, TeammateStatsType>();

    // Add player's own stats first if playerInfo is available
    if (playerInfo) {
      let playerTotalKills = 0;
      let playerTotalAssists = 0;
      let playerTotalDamage = 0;
      const playerMatchCount = selectedMatchData.length;

      selectedMatchData.forEach(match => {
        playerTotalKills += match.stats.kills;
        playerTotalAssists += match.stats.assists;
        playerTotalDamage += match.stats.damage;
      });

      if (playerMatchCount > 0) {
        teammateMap.set(playerInfo.id, {
          name: playerInfo.name + " (나)",
          playerId: playerInfo.id,
          matchCount: playerMatchCount,
          totalKills: playerTotalKills,
          totalAssists: playerTotalAssists,
          totalDamage: playerTotalDamage,
          averageKills: Math.round((playerTotalKills / playerMatchCount) * 10) / 10,
          averageAssists: Math.round((playerTotalAssists / playerMatchCount) * 10) / 10,
          averageDamage: Math.round(playerTotalDamage / playerMatchCount)
        });
      }
    }

    selectedMatchData.forEach(match => {
      if (!match.teammates) return;

      match.teammates.forEach(teammate => {
        const existing = teammateMap.get(teammate.playerId);
        
        if (existing) {
          existing.matchCount += 1;
          existing.totalKills += teammate.kills;
          existing.totalAssists += teammate.assists;
          existing.totalDamage += teammate.damage;
        } else {
          teammateMap.set(teammate.playerId, {
            name: teammate.name,
            playerId: teammate.playerId,
            matchCount: 1,
            totalKills: teammate.kills,
            totalAssists: teammate.assists,
            totalDamage: teammate.damage,
            averageKills: 0,
            averageAssists: 0,
            averageDamage: 0
          });
        }
      });
    });

    // Calculate averages for teammates (player stats already calculated above)
    Array.from(teammateMap.values()).forEach(stats => {
      if (playerInfo && stats.playerId === playerInfo.id) return; // Skip player, already calculated
      stats.averageKills = Math.round((stats.totalKills / stats.matchCount) * 10) / 10;
      stats.averageAssists = Math.round((stats.totalAssists / stats.matchCount) * 10) / 10;
      stats.averageDamage = Math.round(stats.totalDamage / stats.matchCount);
    });

    // Sort: Player first, then by average damage, average kills, average assists
    return Array.from(teammateMap.values())
      .sort((a, b) => {
        // Player always comes first
        if (playerInfo) {
          if (a.playerId === playerInfo.id) return -1;
          if (b.playerId === playerInfo.id) return 1;
        }
        
        // 1순위: 평균 딜량
        if (a.averageDamage !== b.averageDamage) {
          return b.averageDamage - a.averageDamage;
        }
        
        // 2순위: 평균 킬수
        if (a.averageKills !== b.averageKills) {
          return b.averageKills - a.averageKills;
        }
        
        // 3순위: 평균 어시스트
        return b.averageAssists - a.averageAssists;
      });
  }, [matches, selectedMatches, playerInfo]);

  if (teammateStats.length === 0) {
    return null;
  }

  return (
    <div className="mb-8 p-6 bg-gradient-to-br from-purple-900/20 to-blue-900/20 rounded-2xl border border-purple-400/30 backdrop-blur-sm shadow-2xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl shadow-lg">
          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-transparent bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text">
            팀원 통계
          </h2>
          <p className="text-gray-400 text-sm">선택된 매치에서 함께 플레이한 팀원들의 통계입니다</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-purple-400/20">
              <th className="text-left py-3 px-2 font-semibold text-purple-300">닉네임</th>
              <th className="text-center py-3 px-2 font-semibold text-purple-300">판수</th>
              <th className="text-center py-3 px-2 font-semibold text-red-300">평균킬</th>
              <th className="text-center py-3 px-2 font-semibold text-red-300">총킬</th>
              <th className="text-center py-3 px-2 font-semibold text-green-300">평균어시</th>
              <th className="text-center py-3 px-2 font-semibold text-green-300">총어시</th>
              <th className="text-center py-3 px-2 font-semibold text-orange-300">평균딜량</th>
              <th className="text-center py-3 px-2 font-semibold text-orange-300">총딜량</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-purple-400/10">
            {teammateStats.map((teammate, index) => {
              const isPlayer = playerInfo && teammate.playerId === playerInfo.id;
              return (
                <tr 
                  key={teammate.playerId}
                  className={`transition-colors duration-200 ${
                    isPlayer 
                      ? 'bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-l-4 border-yellow-500/50 hover:from-yellow-500/15 hover:to-orange-500/15' 
                      : 'hover:bg-purple-500/5'
                  }`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <td className="py-4 px-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                        isPlayer 
                          ? 'bg-gradient-to-br from-yellow-500 to-orange-500' 
                          : 'bg-gradient-to-br from-purple-500 to-blue-500'
                      }`}>
                        {teammate.name.charAt(0).toUpperCase()}
                      </div>
                      <span className={`font-semibold truncate max-w-[120px] ${
                        isPlayer ? 'text-yellow-300' : 'text-white'
                      }`} title={teammate.name}>
                        {teammate.name}
                      </span>
                    </div>
                  </td>
                <td className="text-center py-4 px-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    {teammate.matchCount}
                  </span>
                </td>
                <td className="text-center py-4 px-2 text-red-300 font-bold">
                  {teammate.averageKills}
                </td>
                <td className="text-center py-4 px-2 text-red-400 font-semibold">
                  {teammate.totalKills}
                </td>
                <td className="text-center py-4 px-2 text-green-300 font-bold">
                  {teammate.averageAssists}
                </td>
                <td className="text-center py-4 px-2 text-green-400 font-semibold">
                  {teammate.totalAssists}
                </td>
                <td className="text-center py-4 px-2 text-orange-300 font-bold">
                  {teammate.averageDamage.toLocaleString()}
                </td>
                <td className="text-center py-4 px-2 text-orange-400 font-semibold">
                  {teammate.totalDamage.toLocaleString()}
                </td>
              </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {teammateStats.length === 0 && (
        <div className="text-center py-8">
          <div className="text-gray-400 text-lg">선택된 매치에서 팀원 데이터가 없습니다.</div>
          <div className="text-gray-500 text-sm mt-1">솔로 매치이거나 팀 데이터를 불러올 수 없습니다.</div>
        </div>
      )}
    </div>
  );
}