# PUBG 전적 검색 웹사이트

카카오/스팀 계정의 PUBG 전적을 조회하고 통계를 확인할 수 있는 반응형 웹사이트입니다.

## 주요 기능

- 🔍 **플레이어 검색**: 카카오 또는 스팀 계정으로 PUBG 전적 검색
- 📊 **통계 분석**: 킬, 데미지, 데스, 어시스트의 총합 및 평균 계산
- ✅ **매치 선택**: 체크박스로 원하는 매치만 선택하여 통계 계산
- 📅 **기간 필터**: 날짜 범위로 매치 필터링
- 🎮 **게임 모드 필터**: 특정 게임 모드나 맵으로 필터링
- 📱 **반응형 디자인**: 모바일, 태블릿, 데스크톱 모든 기기 지원
- 🎨 **다크 테마**: 검은색, 주황색, 노란색을 활용한 게이밍 테마

## 기술 스택

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **API**: PUBG Official API
- **Deployment**: Vercel (권장)

## 시작하기

### 1. 프로젝트 클론

```bash
git clone <repository-url>
cd pubg-stats-tracker
```

### 2. 의존성 설치

```bash
npm install
```

### 3. 환경 변수 설정

`.env.example` 파일을 참고하여 `.env.local` 파일을 생성하고 PUBG API 키를 설정하세요.

```bash
cp .env.example .env.local
```

PUBG API 키는 [PUBG Developer Portal](https://developer.pubg.com/)에서 발급받을 수 있습니다.

### 4. 개발 서버 실행

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000)에서 애플리케이션을 확인할 수 있습니다.

## 사용 방법

1. **플랫폼 선택**: 카카오 또는 스팀 중 선택
2. **플레이어 ID 입력**: 해당 플랫폼의 플레이어 ID나 닉네임 입력
3. **전적 검색**: 검색 버튼을 클릭하여 최근 매치 데이터 조회
4. **매치 선택**: 통계에 포함시킬 매치를 체크박스로 선택
5. **필터 적용**: 날짜, 게임 모드, 맵으로 매치 필터링
6. **통계 확인**: 선택된 매치들의 통계 요약 확인

## 프로젝트 구조

```
src/
├── app/
│   ├── globals.css      # 전역 스타일
│   ├── layout.tsx       # 루트 레이아웃
│   └── page.tsx         # 메인 페이지
├── components/
│   ├── SearchForm.tsx   # 검색 폼 컴포넌트
│   ├── MatchList.tsx    # 매치 리스트 컴포넌트
│   └── StatsSummary.tsx # 통계 요약 컴포넌트
├── types/
│   └── pubg.ts         # TypeScript 타입 정의
└── utils/
    └── pubgApi.ts      # PUBG API 연동 로직
```

## 배포

### Vercel 배포 (권장)

1. Vercel 계정에 로그인
2. 프로젝트를 GitHub에 푸시
3. Vercel에서 해당 저장소를 연결
4. 환경 변수 `NEXT_PUBLIC_PUBG_API_KEY` 설정
5. 자동 배포 완료

### 다른 플랫폼 배포

```bash
npm run build
npm run start
```

## 개발 노트

- **Mock 데이터**: 개발 및 테스트를 위해 MockData 생성 기능 포함
- **API 제한**: PUBG API는 분당 요청 제한이 있으므로 주의
- **플랫폼별 차이**: 카카오와 스팀 플랫폼의 API 엔드포인트가 다름
- **에러 처리**: 네트워크 오류 및 API 오류에 대한 사용자 친화적 메시지 제공

## 라이선스

MIT License