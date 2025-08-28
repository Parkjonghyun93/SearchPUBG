'use client';

import { useState } from 'react';

interface SearchFormProps {
  onSearch: (platform: 'kakao', nickname: string) => void;
  loading: boolean;
}

export default function SearchForm({ onSearch, loading }: SearchFormProps) {
  const [nickname, setNickname] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim()) return;
    
    onSearch('kakao', nickname.trim());
  };

  return (
    <div className="max-w-3xl mx-auto mb-12">
      <form onSubmit={handleSubmit} className="relative">
        <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8 rounded-3xl border border-orange-400/20 backdrop-blur-sm shadow-2xl">
          {/* 헤더 섹션 */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="p-4 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-2xl shadow-lg">
                <svg className="w-8 h-8 text-black" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h2 className="text-3xl font-bold text-transparent bg-gradient-to-r from-orange-400 to-yellow-400 bg-clip-text">
                  플레이어 검색
                </h2>
                <p className="text-gray-400 text-lg">카카오 닉네임으로 PUBG 전적을 조회하세요</p>
              </div>
            </div>
          </div>

          {/* 플랫폼 표시 */}
          <div className="mb-8">
            <div className="flex justify-center">
              <div className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-orange-500/20 to-yellow-500/20 rounded-2xl border border-orange-400/30">
                <div className="p-2 bg-orange-500 rounded-lg">
                  <span className="text-lg font-bold text-black">K</span>
                </div>
                <span className="text-orange-300 font-semibold text-lg">카카오 플랫폼</span>
              </div>
            </div>
          </div>

          {/* 입력 필드 */}
          <div className="mb-8">
            <label htmlFor="nickname" className="block text-orange-400 font-bold mb-4 text-xl text-center">
              카카오 닉네임을 입력하세요
            </label>
            <div className="relative">
              <input
                type="text"
                id="nickname"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="카카오 닉네임 입력..."
                className="w-full px-6 py-4 text-xl bg-gray-800/50 border-2 border-gray-600/50 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-400/20 transition-all duration-300 backdrop-blur-sm"
                disabled={loading}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-6">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>
          </div>

          {/* 검색 버튼 */}
          <button
            type="submit"
            disabled={loading || !nickname.trim()}
            className="w-full relative overflow-hidden bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 disabled:from-gray-600 disabled:to-gray-700 text-black font-bold py-5 px-8 rounded-2xl transition-all duration-300 text-xl disabled:cursor-not-allowed transform hover:scale-[1.02] hover:shadow-2xl hover:shadow-orange-500/25 active:scale-[0.98]"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-3">
                <div className="w-6 h-6 border-3 border-black border-t-transparent rounded-full animate-spin"></div>
                전적 조회 중...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                전적 검색 시작
              </span>
            )}
            
            {/* 호버 효과 */}
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] hover:translate-x-[100%] transition-transform duration-700"></div>
          </button>

          {/* 추가 정보 */}
          <div className="mt-6 text-center">
            <p className="text-gray-500 text-sm">
              💡 카카오 플랫폼의 정확한 닉네임을 입력해주세요
            </p>
            <div className="mt-2 text-xs text-gray-600">
              닉네임을 통해 플레이어 ID를 자동으로 조회한 후 매치 데이터를 가져옵니다
            </div>
          </div>
        </div>

        {/* 배경 장식 */}
        <div className="absolute -inset-4 bg-gradient-to-r from-orange-600/10 to-yellow-600/10 rounded-[2rem] blur-xl -z-10"></div>
      </form>
    </div>
  );
}