'use client';

import { useState } from 'react';
import SearchForm from '@/components/SearchForm';
import MatchList from '@/components/MatchList';
import StatsSummary from '@/components/StatsSummary';
import TeammateStats from '@/components/TeammateStats';
import { MatchData, FilterOptions, PlayerInfo } from '@/types/pubg';
import { pubgApi } from '@/utils/pubgApi';

export default function Home() {
  const [matches, setMatches] = useState<MatchData[]>([]);
  const [selectedMatches, setSelectedMatches] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [currentOffset, setCurrentOffset] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [playerInfo, setPlayerInfo] = useState<PlayerInfo | null>(null);

  const handleSearch = async (platform: 'kakao', nickname: string) => {
    setLoading(true);
    setError(null);
    setMatches([]);
    setSelectedMatches([]);
    setPlayerInfo(null);
    setCurrentOffset(0);
    setHasMore(false);
    
    try {
      // Step 1: 닉네임으로 플레이어 정보 조회
      const playerData = await pubgApi.searchPlayerByNickname(platform, nickname);
      
      setPlayerInfo(playerData);
      
      // Step 2: 플레이어 ID로 매치 데이터 조회
      const matchResponse = await pubgApi.getPlayerMatches(playerData.id, platform, 0, 20);
      
      setMatches(matchResponse.matches);
      setSelectedMatches(matchResponse.matches.map(m => m.id));
      setCurrentOffset(20);
      setHasMore(matchResponse.pagination.hasMore);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : '검색 중 오류가 발생했습니다.');
      setMatches([]);
      setSelectedMatches([]);
      setPlayerInfo(null);
      setCurrentOffset(0);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  const handleMatchToggle = (matchId: string) => {
    setSelectedMatches(prev => 
      prev.includes(matchId) 
        ? prev.filter(id => id !== matchId)
        : [...prev, matchId]
    );
  };

  const handleSync = async () => {
    if (!playerInfo) return;
    
    setSyncing(true);
    setError(null);
    
    try {
      // Re-fetch player matches with latest data
      const matchResponse = await pubgApi.getPlayerMatches(playerInfo.id, 'kakao', 0, 20);
      
      setMatches(matchResponse.matches);
      setSelectedMatches(matchResponse.matches.map(m => m.id));
      setCurrentOffset(20);
      setHasMore(matchResponse.pagination.hasMore);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : '동기화 중 오류가 발생했습니다.');
    } finally {
      setSyncing(false);
    }
  };

  const handleLoadMore = async () => {
    if (!playerInfo || loadingMore || !hasMore) return;
    
    setLoadingMore(true);
    setError(null);
    
    try {
      const matchResponse = await pubgApi.getPlayerMatches(playerInfo.id, 'kakao', currentOffset, 20);
      
      setMatches(prev => [...prev, ...matchResponse.matches]);
      setSelectedMatches(prev => [...prev, ...matchResponse.matches.map(m => m.id)]);
      setCurrentOffset(prev => prev + 20);
      setHasMore(matchResponse.pagination.hasMore);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : '추가 매치 로드 중 오류가 발생했습니다.');
    } finally {
      setLoadingMore(false);
    }
  };

  const handleFilterChange = (filters: FilterOptions) => {
    let filteredMatches = [...matches];

    if (filters.startDate) {
      filteredMatches = filteredMatches.filter(
        match => new Date(match.createdAt) >= new Date(filters.startDate!)
      );
    }

    if (filters.endDate) {
      filteredMatches = filteredMatches.filter(
        match => new Date(match.createdAt) <= new Date(filters.endDate!)
      );
    }

    if (filters.gameMode) {
      filteredMatches = filteredMatches.filter(
        match => match.gameMode === filters.gameMode
      );
    }

    if (filters.mapName) {
      filteredMatches = filteredMatches.filter(
        match => match.mapName === filters.mapName
      );
    }

    setSelectedMatches(filteredMatches.map(m => m.id));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white relative overflow-hidden">
      {/* 배경 장식 */}
      <div className="absolute inset-0 opacity-50">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-yellow-500/5"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-orange-500/10 via-transparent to-transparent"></div>
      </div>
      
      <div className="container mx-auto px-4 py-12 relative z-10">
        <header className="text-center mb-16">
          <div className="inline-flex items-center gap-6 mb-8">
            <div className="p-6 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-3xl shadow-2xl">
              <svg className="w-12 h-12 text-black" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="text-left">
              <h1 className="text-5xl md:text-7xl font-black mb-2 bg-gradient-to-r from-orange-400 via-yellow-400 to-orange-500 bg-clip-text text-transparent tracking-tight">
                으핳핳하하하
              </h1>
              <p className="text-gray-400 text-xl md:text-2xl font-light text-center">
                으히힣히힣히
              </p>
            </div>
          </div>
        </header>

        <SearchForm onSearch={handleSearch} loading={loading} />

        {error && (
          <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {playerInfo && (
          <div className="mb-8 p-6 bg-gradient-to-br from-orange-900/20 to-yellow-900/20 rounded-2xl border border-orange-400/30 backdrop-blur-sm shadow-2xl">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-xl">
                  <span className="text-2xl">👤</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-transparent bg-gradient-to-r from-orange-400 to-yellow-400 bg-clip-text">
                    검색 결과
                  </h2>
                  <p className="text-gray-400 text-sm">플레이어 정보가 성공적으로 조회되었습니다</p>
                </div>
              </div>
              <button
                onClick={handleSync}
                disabled={syncing}
                className="group flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-700 text-white rounded-xl transition-all duration-300 font-medium shadow-lg hover:shadow-green-500/30 transform hover:scale-[1.02] disabled:hover:scale-100"
              >
                <svg 
                  className={`w-5 h-5 transition-transform ${syncing ? 'animate-spin' : 'group-hover:rotate-180'}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {syncing ? '동기화 중...' : '동기화'}
              </button>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 text-lg">
              <div className="flex items-center gap-2">
                <span className="px-4 py-2 bg-orange-500/20 text-orange-300 rounded-full font-medium border border-orange-500/30">
                  카카오
                </span>
                <span className="text-gray-400">•</span>
                <span className="text-yellow-300 font-semibold text-xl">{playerInfo.name}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <span>Player ID:</span>
                <span className="px-2 py-1 bg-gray-700/50 rounded font-mono text-xs">{playerInfo.id}</span>
              </div>
            </div>
          </div>
        )}

        {matches.length > 0 && (
          <>
            <StatsSummary 
              matches={matches.filter(m => selectedMatches.includes(m.id))} 
            />
            <TeammateStats 
              matches={matches}
              selectedMatches={selectedMatches}
              playerInfo={playerInfo ? { id: playerInfo.id, name: playerInfo.name } : undefined}
            />
            <MatchList
              matches={matches}
              selectedMatches={selectedMatches}
              onMatchToggle={handleMatchToggle}
              onFilterChange={handleFilterChange}
              onLoadMore={handleLoadMore}
              hasMore={hasMore}
              loadingMore={loadingMore}
              nickname={playerInfo?.name}
            />
          </>
        )}
      </div>
    </div>
  );
}