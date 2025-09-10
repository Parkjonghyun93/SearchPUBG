'use client';

import { useState, useEffect, useMemo } from 'react';
import { MatchData, FilterOptions } from '@/types/pubg';
import { groupConsecutiveMatches, MatchGroup, formatDateRange } from '@/utils/matchGrouping';

interface MatchListProps {
  matches: MatchData[];
  selectedMatches: string[];
  onMatchToggle: (matchId: string) => void;
  onFilterChange: (filters: FilterOptions) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  loadingMore?: boolean;
  nickname?: string;
}

export default function MatchList({ matches, selectedMatches, onMatchToggle, onFilterChange, onLoadMore, hasMore, loadingMore, nickname = "플레이어" }: MatchListProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({});
  const [expandedMatches, setExpandedMatches] = useState<Set<string>>(new Set());
  const [loadingTeammates, setLoadingTeammates] = useState<Set<string>>(new Set());

  // 매치 그룹 계산
  const matchGroups = useMemo(() => groupConsecutiveMatches(matches), [matches]);
  
  const uniqueGameModes = [...new Set(matches.map(m => m.gameMode))];
  const uniqueMaps = [...new Set(matches.map(m => m.mapName))];

  // 날짜 그룹 필터 핸들러
  const handleDateGroupSelect = (group: MatchGroup) => {
    // 현재 그룹의 매치들이 모두 선택되어 있는지 확인
    const isGroupSelected = group.matchIds.every(matchId => selectedMatches.includes(matchId));
    
    if (isGroupSelected) {
      // 그룹이 모두 선택되어 있으면 해제
      group.matchIds.forEach(matchId => {
        if (selectedMatches.includes(matchId)) {
          onMatchToggle(matchId);
        }
      });
    } else {
      // 그룹이 선택되어 있지 않으면 모두 선택
      group.matchIds.forEach(matchId => {
        if (!selectedMatches.includes(matchId)) {
          onMatchToggle(matchId);
        }
      });
    }
  };

  const handleFilterChange = (newFilters: Partial<FilterOptions>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  const clearFilters = () => {
    setFilters({});
    onFilterChange({});
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    return `${minutes}분`;
  };

  const toggleMatchExpansion = (matchId: string) => {
    const newExpanded = new Set(expandedMatches);
    if (newExpanded.has(matchId)) {
      newExpanded.delete(matchId);
    } else {
      newExpanded.add(matchId);
    }
    setExpandedMatches(newExpanded);
  };

  const loadTeammates = async (matchId: string) => {
    // 이미 팀원 정보가 있는 경우 바로 표시
    const match = matches.find(m => m.id === matchId);
    if (match?.teammates && match.teammates.length > 0) {
      return;
    }

    setLoadingTeammates(prev => new Set([...prev, matchId]));
    
    try {
      // 실제 API 호출 로직은 필요시 구현
      // 현재는 기존 teammates 데이터를 사용
      await new Promise(resolve => setTimeout(resolve, 500)); // 로딩 시뮬레이션
    } catch (error) {
      console.error('팀원 정보 로드 실패:', error);
    } finally {
      setLoadingTeammates(prev => {
        const newSet = new Set(prev);
        newSet.delete(matchId);
        return newSet;
      });
    }
  };

  // 무기 아이콘 매핑 (예시 데이터)
  const getWeaponIcon = (weaponName: string) => {
    const weaponType = weaponName.toLowerCase();
    if (weaponType.includes('rifle') || weaponType.includes('ak') || weaponType.includes('m4')) {
      return '🔫'; // 라이플
    } else if (weaponType.includes('sniper') || weaponType.includes('kar') || weaponType.includes('awm')) {
      return '🎯'; // 저격총
    } else if (weaponType.includes('shotgun') || weaponType.includes('s12k')) {
      return '💥'; // 샷건
    } else if (weaponType.includes('pistol') || weaponType.includes('p92')) {
      return '🔫'; // 권총
    } else {
      return '⚔️'; // 기타
    }
  };

  // 투척무기 아이콘 매핑
  const getThrowableIcon = (throwableName: string) => {
    const throwableType = throwableName.toLowerCase();
    if (throwableType.includes('frag') || throwableType.includes('grenade')) {
      return '💣'; // 수류탄
    } else if (throwableType.includes('smoke')) {
      return '💨'; // 연막탄
    } else if (throwableType.includes('flash') || throwableType.includes('stun')) {
      return '⚡'; // 섬광탄
    } else if (throwableType.includes('molotov')) {
      return '🔥'; // 화염병
    } else {
      return '💥'; // 기타
    }
  };

  // 맵 이름 한글 변환
  const getMapNameInKorean = (mapName: string) => {
    const mapTranslations: { [key: string]: string } = {
      'Baltic_Main': '발틱',
      'Desert_Main': '미라마',
      'DihorOtok_Main': '카라킨',
      'Erangel_Main': '에란겔',
      'Range_Main': '트레이닝',
      'Savage_Main': '사녹',
      'Tiger_Main': '테이고'
    };
    
    return mapTranslations[mapName] || mapName;
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-2xl shadow-lg">
            <svg className="w-6 h-6 text-black" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h2 className="text-3xl font-bold text-transparent bg-gradient-to-r from-orange-400 to-yellow-400 bg-clip-text">
              매치 리스트
            </h2>
            <p className="text-gray-400 text-lg">{matches.length}개의 매치가 조회되었습니다</p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="group flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gray-800 to-gray-700 hover:from-gray-700 hover:to-gray-600 border border-orange-400/30 hover:border-orange-400/60 text-orange-300 hover:text-orange-200 rounded-2xl transition-all duration-300 font-semibold shadow-lg hover:shadow-orange-500/20"
          >
            <svg className="w-5 h-5 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
            </svg>
            필터 {showFilters ? '숨기기' : '보기'}
          </button>
          <button
            onClick={() => {
              const allIds = matches.map(m => m.id);
              allIds.forEach(id => {
                if (!selectedMatches.includes(id)) {
                  onMatchToggle(id);
                }
              });
            }}
            className="group flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-black rounded-2xl transition-all duration-300 font-bold shadow-lg hover:shadow-yellow-500/30 transform hover:scale-[1.02]"
          >
            <svg className="w-5 h-5 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            전체 선택
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="bg-gray-900 p-6 rounded-xl border border-orange-500/30">
          <h3 className="text-lg font-semibold text-orange-400 mb-4">필터 옵션</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-yellow-400 mb-2">시작 날짜</label>
              <input
                type="date"
                value={filters.startDate || ''}
                onChange={(e) => handleFilterChange({ startDate: e.target.value })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-yellow-400 mb-2">종료 날짜</label>
              <input
                type="date"
                value={filters.endDate || ''}
                onChange={(e) => handleFilterChange({ endDate: e.target.value })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-yellow-400 mb-2">게임 모드</label>
              <select
                value={filters.gameMode || ''}
                onChange={(e) => handleFilterChange({ gameMode: e.target.value })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-orange-500"
              >
                <option value="">전체</option>
                {uniqueGameModes.map(mode => (
                  <option key={mode} value={mode}>{mode}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-yellow-400 mb-2">맵</label>
              <select
                value={filters.mapName || ''}
                onChange={(e) => handleFilterChange({ mapName: e.target.value })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-orange-500"
              >
                <option value="">전체</option>
                {uniqueMaps.map(map => (
                  <option key={map} value={map}>{getMapNameInKorean(map)}</option>
                ))}
              </select>
            </div>
          </div>
          <button
            onClick={clearFilters}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
          >
            필터 초기화
          </button>
        </div>
      )}

      {/* 날짜별 연속 경기 필터 */}
      {matchGroups.length > 1 && (
        <div className="bg-gray-900 p-4 rounded-xl border border-blue-500/30">
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="text-lg font-semibold text-blue-400">연속 경기 날짜별 선택</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {matchGroups.map((group, index) => {
              const isGroupSelected = group.matchIds.every(matchId => selectedMatches.includes(matchId));
              const isPartiallySelected = group.matchIds.some(matchId => selectedMatches.includes(matchId)) && !isGroupSelected;
              
              return (
                <button
                  key={index}
                  onClick={() => handleDateGroupSelect(group)}
                  className={`group relative px-4 py-2 rounded-lg font-medium transition-all duration-300 text-sm ${
                    isGroupSelected
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/30 transform scale-105'
                      : isPartiallySelected
                      ? 'bg-gradient-to-r from-yellow-600/20 to-orange-600/20 text-yellow-300 border border-yellow-500/50'
                      : 'bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white border border-gray-600'
                  }`}
                  title={formatDateRange(group.startDate, group.endDate)}
                >
                  {isPartiallySelected && (
                    <div className="absolute -inset-1 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-lg blur-sm"></div>
                  )}
                  <div className="relative flex items-center gap-2">
                    <span>{group.displayDate}</span>
                    {isGroupSelected && (
                      <svg className="w-4 h-4 text-green-300" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                    {isPartiallySelected && (
                      <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                      </svg>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
          <div className="mt-3 text-sm text-gray-400">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full"></div>
                <span>모두 선택됨</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gradient-to-r from-yellow-600/50 to-orange-600/50 border border-yellow-500/50 rounded-full"></div>
                <span>일부 선택됨</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gray-800 border border-gray-600 rounded-full"></div>
                <span>선택 안됨</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {matches.map((match, index) => {
          const isExpanded = expandedMatches.has(match.id);
          const isLoadingTeammates = loadingTeammates.has(match.id);
          
          return (
            <div
              key={match.id}
              className={`group relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl border transition-all duration-300 ${
                selectedMatches.includes(match.id)
                  ? 'border-orange-400/60 shadow-2xl shadow-orange-500/20 bg-gradient-to-br from-orange-900/10 via-gray-800 to-yellow-900/10'
                  : 'border-gray-700/50 hover:border-orange-400/40 hover:shadow-lg hover:shadow-orange-500/10'
              } ${isExpanded ? 'transform scale-[1.01]' : 'hover:scale-[1.01]'}`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* 선택 상태 표시 */}
              {selectedMatches.includes(match.id) && (
                <div className="absolute -inset-1 bg-gradient-to-r from-orange-500/20 to-yellow-500/20 rounded-2xl blur-sm"></div>
              )}
              
              <div className="relative">
                {/* 메인 매치 정보 - 클릭 가능한 헤더 */}
                <div 
                  className="p-6 cursor-pointer hover:bg-gray-800/30 transition-colors duration-200 rounded-t-2xl"
                  onClick={() => toggleMatchExpansion(match.id)}
                >
                  <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="flex-shrink-0 mt-1" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedMatches.includes(match.id)}
                          onChange={(e) => {
                            e.stopPropagation();
                            onMatchToggle(match.id);
                          }}
                          className="w-6 h-6 text-orange-500 bg-gray-700 border-2 border-gray-600 rounded-lg focus:ring-orange-500 focus:ring-2 focus:ring-offset-0 transition-all duration-200"
                        />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-3 mb-3">
                          <h3 className="font-bold text-xl text-white group-hover:text-orange-200 transition-colors">
                            {match.gameMode}
                          </h3>
                          <span className="px-4 py-2 bg-gradient-to-r from-orange-600 to-orange-500 text-white text-sm font-bold rounded-xl shadow-md">
                            {getMapNameInKorean(match.mapName)}
                          </span>
                          <span className={`px-4 py-2 text-sm font-bold rounded-xl shadow-md ${
                            match.stats.placement === 1 
                              ? 'bg-gradient-to-r from-yellow-400 to-yellow-300 text-black' 
                              : match.stats.placement === 2
                              ? 'bg-gradient-to-r from-gray-300 to-gray-200 text-black'
                              : match.stats.placement >= 3 && match.stats.placement <= 5
                              ? 'bg-gradient-to-r from-orange-600 to-orange-500 text-white'
                              : 'bg-gradient-to-r from-gray-700 to-gray-600 text-gray-300'
                          }`}>
                            #{match.stats.placement}위
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-4 text-gray-400 text-sm">
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {formatDate(match.createdAt)}
                          </div>
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {formatDuration(match.duration)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 중간 스탯 영역 */}
                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                      <div className="text-center p-3 bg-red-500/10 rounded-xl border border-red-500/20">
                        <div className="text-2xl font-bold text-red-400 mb-1">{match.stats.kills}</div>
                        <div className="text-xs text-red-300 font-medium">킬</div>
                      </div>
                      <div className="text-center p-3 bg-orange-500/10 rounded-xl border border-orange-500/20">
                        <div className="text-2xl font-bold text-orange-400 mb-1">{match.stats.damage.toLocaleString()}</div>
                        <div className="text-xs text-orange-300 font-medium">데미지</div>
                      </div>
                      <div className="text-center p-3 bg-purple-500/10 rounded-xl border border-purple-500/20">
                        <div className="text-2xl font-bold text-purple-400 mb-1">{match.stats.deaths}</div>
                        <div className="text-xs text-purple-300 font-medium">데스</div>
                      </div>
                      <div className="text-center p-3 bg-green-500/10 rounded-xl border border-green-500/20">
                        <div className="text-2xl font-bold text-green-400 mb-1">{match.stats.assists}</div>
                        <div className="text-xs text-green-300 font-medium">어시스트</div>
                      </div>
                      {match.stats.dbno !== undefined && (
                        <div className="text-center p-3 bg-yellow-500/10 rounded-xl border border-yellow-500/20">
                          <div className="text-2xl font-bold text-yellow-400 mb-1">{match.stats.dbno}</div>
                          <div className="text-xs text-yellow-300 font-medium">기절</div>
                        </div>
                      )}
                    </div>

                    {/* 우측 팀원 이름 영역 */}
                    <div className="flex-shrink-0 lg:w-32">
                      <div className="text-xs text-gray-400 mb-2">팀원</div>
                      <div className="space-y-1">
                        {match.teammates && match.teammates.length > 0 ? (
                          <>
                            <div className="text-sm font-bold truncate bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">{nickname}</div>
                            {match.teammates.slice(0, 3).map((teammate, idx) => (
                              <div key={idx} className="text-sm text-gray-300 truncate">
                                {teammate.name}
                              </div>
                            ))}
                          </>
                        ) : (
                          <>
                            <div className="text-sm font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">{nickname}</div>
                            <div className="text-sm text-gray-500">팀원1</div>
                            <div className="text-sm text-gray-500">팀원2</div>
                            <div className="text-sm text-gray-500">팀원3</div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 확장된 상세 정보 */}
                {isExpanded && (
                  <div className="border-t border-gray-700/50 bg-gray-800/30 rounded-b-2xl">
                    <div className="p-6 space-y-6">
                      {/* 무기 정보 섹션 */}
                      {match.weapons && match.weapons.length > 0 && (
                        <div>
                          <h4 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
                            <span className="text-2xl">🔫</span>
                            사용한 무기
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {match.weapons.map((weapon, idx) => (
                              <div key={idx} className="bg-gray-700/30 rounded-lg p-4 border border-gray-600/30">
                                <div className="flex items-center gap-3 mb-3">
                                  <span className="text-xl">{getWeaponIcon(weapon.name)}</span>
                                  <h5 className="font-semibold text-white">{weapon.name}</h5>
                                </div>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                  <div>
                                    <div className="text-red-400 font-bold text-lg">{weapon.kills}</div>
                                    <div className="text-red-300 text-xs">킬</div>
                                  </div>
                                  <div>
                                    <div className="text-orange-400 font-bold text-lg">{weapon.damage.toLocaleString()}</div>
                                    <div className="text-orange-300 text-xs">데미지</div>
                                  </div>
                                  <div>
                                    <div className="text-blue-400 font-bold text-lg">{weapon.hits}/{weapon.shots}</div>
                                    <div className="text-blue-300 text-xs">명중률</div>
                                  </div>
                                  <div>
                                    <div className="text-green-400 font-bold text-lg">{weapon.shots > 0 ? ((weapon.hits / weapon.shots) * 100).toFixed(1) : 0}%</div>
                                    <div className="text-green-300 text-xs">정확도</div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 투척무기 정보 섹션 */}
                      {match.throwables && match.throwables.length > 0 && (
                        <div>
                          <h4 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
                            <span className="text-2xl">💣</span>
                            사용한 투척무기
                          </h4>
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {match.throwables.map((throwable, idx) => (
                              <div key={idx} className="bg-gray-700/30 rounded-lg p-4 border border-gray-600/30 text-center">
                                <div className="text-3xl mb-2">{getThrowableIcon(throwable.name)}</div>
                                <h5 className="font-semibold text-white text-sm mb-2">{throwable.name}</h5>
                                <div className="text-2xl font-bold text-yellow-400 mb-1">{throwable.count}</div>
                                <div className="text-yellow-300 text-xs">사용횟수</div>
                                {throwable.damage && (
                                  <div className="mt-2">
                                    <div className="text-orange-400 font-bold">{throwable.damage.toLocaleString()}</div>
                                    <div className="text-orange-300 text-xs">데미지</div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 팀원 정보 섹션 */}
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                            <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857M16 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                            팀원 정보
                          </h4>
                          
                          {/* 팀원 정보 로드 버튼 */}
                          {(!match.teammates || match.teammates.length === 0) && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                loadTeammates(match.id);
                              }}
                              disabled={isLoadingTeammates}
                              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white text-sm font-medium rounded-lg transition-colors"
                            >
                              {isLoadingTeammates ? (
                                <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                              ) : (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                              )}
                              {isLoadingTeammates ? '로딩 중...' : '팀원 정보 보기'}
                            </button>
                          )}
                        </div>
                        
                        {/* 팀원 목록 */}
                        {isLoadingTeammates ? (
                          <div className="flex justify-center items-center py-8">
                            <div className="flex items-center gap-3 text-gray-400">
                              <svg className="w-6 h-6 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                              </svg>
                              <span>팀원 정보를 불러오는 중...</span>
                            </div>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            {/* 내 정보 (첫 번째로 표시) */}
                            <div className="bg-blue-700/20 rounded-lg p-4 border border-blue-500/30 relative">
                              <div className="absolute top-2 right-2 px-2 py-1 bg-gradient-to-r from-cyan-500/30 to-blue-500/30 text-cyan-300 text-xs font-bold rounded-md border border-cyan-400/30">
                                ME
                              </div>
                              <div className="flex justify-between items-start mb-3">
                                <h5 className="font-bold text-transparent bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text truncate">{nickname}</h5>
                                <span className={`px-2 py-1 text-xs font-bold rounded-md ${
                                  match.stats.placement === 1 
                                    ? 'bg-yellow-400/20 text-yellow-300' 
                                    : match.stats.placement <= 10 
                                    ? 'bg-orange-400/20 text-orange-300'
                                    : 'bg-gray-400/20 text-gray-300'
                                }`}>
                                  #{match.stats.placement}
                                </span>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                                <div className="text-center">
                                  <div className="text-red-400 font-bold text-lg">{match.stats.kills}</div>
                                  <div className="text-red-300 text-xs">킬</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-orange-400 font-bold text-lg">{match.stats.damage.toLocaleString()}</div>
                                  <div className="text-orange-300 text-xs">데미지</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-green-400 font-bold text-lg">{match.stats.assists}</div>
                                  <div className="text-green-300 text-xs">어시</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-purple-400 font-bold text-lg">{match.stats.deaths}</div>
                                  <div className="text-purple-300 text-xs">데스</div>
                                </div>
                              </div>

                              {match.stats.dbno !== undefined && (
                                <div className="text-center mb-3">
                                  <div className="text-yellow-400 font-bold text-lg">{match.stats.dbno}</div>
                                  <div className="text-yellow-300 text-xs">기절</div>
                                </div>
                              )}

                              {/* 내 무기 정보 */}
                              {match.weapons && match.weapons.length > 0 && (
                                <div className="border-t border-blue-600/30 pt-3 mt-3">
                                  <div className="text-xs text-blue-300 mb-2">주요 무기</div>
                                  <div className="flex flex-wrap gap-1">
                                    {match.weapons.slice(0, 3).map((weapon, wIdx) => (
                                      <span key={wIdx} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-600/30 rounded text-xs text-blue-200">
                                        {getWeaponIcon(weapon.name)} {weapon.kills}킬
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* 팀원들 정보 */}
                            {match.teammates && match.teammates.length > 0 ? (
                              match.teammates.map((teammate, idx) => (
                                <div key={teammate.playerId || idx} className="bg-gray-700/30 rounded-lg p-4 border border-gray-600/30">
                                  <div className="flex justify-between items-start mb-3">
                                    <h5 className="font-semibold text-white truncate">{teammate.name}</h5>
                                    <span className={`px-2 py-1 text-xs font-bold rounded-md ${
                                      teammate.placement === 1 
                                        ? 'bg-yellow-400/20 text-yellow-300' 
                                        : teammate.placement <= 10 
                                        ? 'bg-orange-400/20 text-orange-300'
                                        : 'bg-gray-400/20 text-gray-300'
                                    }`}>
                                      #{teammate.placement}
                                    </span>
                                  </div>
                                  
                                  <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                                    <div className="text-center">
                                      <div className="text-red-400 font-bold text-lg">{teammate.kills}</div>
                                      <div className="text-red-300 text-xs">킬</div>
                                    </div>
                                    <div className="text-center">
                                      <div className="text-orange-400 font-bold text-lg">{teammate.damage.toLocaleString()}</div>
                                      <div className="text-orange-300 text-xs">데미지</div>
                                    </div>
                                    <div className="text-center">
                                      <div className="text-green-400 font-bold text-lg">{teammate.assists}</div>
                                      <div className="text-green-300 text-xs">어시</div>
                                    </div>
                                    <div className="text-center">
                                      <div className="text-purple-400 font-bold text-lg">{teammate.deaths}</div>
                                      <div className="text-purple-300 text-xs">데스</div>
                                    </div>
                                  </div>

                                  {teammate.dbno !== undefined && (
                                    <div className="text-center mb-3">
                                      <div className="text-yellow-400 font-bold text-lg">{teammate.dbno}</div>
                                      <div className="text-yellow-300 text-xs">기절</div>
                                    </div>
                                  )}

                                  {/* 팀원 무기 정보 */}
                                  {teammate.weapons && teammate.weapons.length > 0 && (
                                    <div className="border-t border-gray-600/30 pt-3 mt-3">
                                      <div className="text-xs text-gray-400 mb-2">주요 무기</div>
                                      <div className="flex flex-wrap gap-1">
                                        {teammate.weapons.slice(0, 3).map((weapon, wIdx) => (
                                          <span key={wIdx} className="inline-flex items-center gap-1 px-2 py-1 bg-gray-600/50 rounded text-xs text-gray-300">
                                            {getWeaponIcon(weapon.name)} {weapon.kills}킬
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ))
                            ) : (
                              // 팀원 정보가 없을 때 플레이스홀더
                              <>
                                <div className="bg-gray-700/20 rounded-lg p-4 border border-gray-600/20">
                                  <div className="text-gray-500 text-center py-4">팀원1</div>
                                </div>
                                <div className="bg-gray-700/20 rounded-lg p-4 border border-gray-600/20">
                                  <div className="text-gray-500 text-center py-4">팀원2</div>
                                </div>
                                <div className="bg-gray-700/20 rounded-lg p-4 border border-gray-600/20">
                                  <div className="text-gray-500 text-center py-4">팀원3</div>
                                </div>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 더 불러오기 버튼 */}
      {hasMore && onLoadMore && (
        <div className="flex justify-center pt-8">
          <button
            onClick={onLoadMore}
            disabled={loadingMore}
            className="group flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-600 disabled:to-gray-700 text-white rounded-2xl transition-all duration-300 font-bold shadow-lg hover:shadow-blue-500/30 transform hover:scale-[1.02] disabled:hover:scale-100"
          >
            <svg 
              className={`w-6 h-6 transition-transform ${loadingMore ? 'animate-spin' : 'group-hover:translate-y-1'}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              {loadingMore ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              )}
            </svg>
            <span className="text-lg">
              {loadingMore ? '로딩 중...' : '더 불러오기'}
            </span>
          </button>
        </div>
      )}

      {matches.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg">매치 데이터가 없습니다.</div>
        </div>
      )}
    </div>
  );
}