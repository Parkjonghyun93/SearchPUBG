import { MatchData } from '@/types/pubg';

export interface MatchGroup {
  startDate: string;
  endDate: string;
  displayDate: string;
  matchCount: number;
  matchIds: string[];
}

const TIME_GAP_THRESHOLD = 3 * 60 * 60 * 1000; // 3시간 (밀리초)

export function groupConsecutiveMatches(matches: MatchData[]): MatchGroup[] {
  if (!matches.length) return [];

  // 날짜순으로 정렬
  const sortedMatches = [...matches].sort((a, b) => 
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  const groups: MatchGroup[] = [];
  let currentGroup: {
    matches: MatchData[];
    startDate: Date;
    endDate: Date;
  } = {
    matches: [sortedMatches[0]],
    startDate: new Date(sortedMatches[0].createdAt),
    endDate: new Date(sortedMatches[0].createdAt)
  };

  for (let i = 1; i < sortedMatches.length; i++) {
    const currentMatch = sortedMatches[i];
    const currentTime = new Date(currentMatch.createdAt).getTime();
    const lastMatchTime = currentGroup.endDate.getTime();

    // 현재 매치와 마지막 매치 사이의 시간 간격 확인
    if (currentTime - lastMatchTime <= TIME_GAP_THRESHOLD) {
      // 연속된 경기로 간주하여 현재 그룹에 추가
      currentGroup.matches.push(currentMatch);
      currentGroup.endDate = new Date(currentMatch.createdAt);
    } else {
      // 새로운 그룹 시작
      // 현재 그룹을 저장
      if (currentGroup.matches.length > 0) {
        groups.push(createMatchGroup(currentGroup));
      }
      
      // 새로운 그룹 시작
      currentGroup = {
        matches: [currentMatch],
        startDate: new Date(currentMatch.createdAt),
        endDate: new Date(currentMatch.createdAt)
      };
    }
  }

  // 마지막 그룹 저장
  if (currentGroup.matches.length > 0) {
    groups.push(createMatchGroup(currentGroup));
  }

  return groups;
}

function createMatchGroup(group: {
  matches: MatchData[];
  startDate: Date;
  endDate: Date;
}): MatchGroup {
  const startDate = group.startDate.toISOString();
  const endDate = group.endDate.toISOString();
  const displayDate = formatGroupDisplayDate(group.startDate, group.endDate, group.matches.length);
  
  return {
    startDate,
    endDate,
    displayDate,
    matchCount: group.matches.length,
    matchIds: group.matches.map(m => m.id)
  };
}

function formatGroupDisplayDate(startDate: Date, endDate: Date, matchCount: number): string {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  const startMonth = start.getMonth() + 1;
  const startDay = start.getDate();
  const startHour = start.getHours();
  
  const endMonth = end.getMonth() + 1;
  const endDay = end.getDate();
  const endHour = end.getHours();
  const endMinute = end.getMinutes();
  
  // 같은 날인지 확인
  if (startMonth === endMonth && startDay === endDay) {
    return `${startMonth}월 ${startDay}일 (${matchCount}판)`;
  } else {
    // 다른 날로 넘어간 경우, 시작 날짜 기준으로 표시
    return `${startMonth}월 ${startDay}일 (${matchCount}판)`;
  }
}

function getMatchCount(matches: MatchData[]): number {
  return matches.length;
}

export function isMatchInGroup(matchId: string, group: MatchGroup): boolean {
  return group.matchIds.includes(matchId);
}

export function getMatchesInGroup(matches: MatchData[], group: MatchGroup): MatchData[] {
  return matches.filter(match => group.matchIds.includes(match.id));
}

export function formatDateRange(startDate: string, endDate: string): string {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  const startStr = start.toLocaleDateString('ko-KR', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  
  const endStr = end.toLocaleDateString('ko-KR', {
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  
  return `${startStr} ~ ${endStr}`;
}