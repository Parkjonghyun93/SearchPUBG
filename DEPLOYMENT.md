# Firebase 배포 가이드

## 사전 준비

1. **Firebase 프로젝트 설정**
   - Firebase 프로젝트: `micro-mining` (이미 생성됨)
   - 호스팅 사이트: `pubgsearch.web.app` (이미 추가됨)

2. **Firebase CLI 로그인**
   ```bash
   npm run firebase:login
   ```

## 배포 과정

### 첫 배포 시
1. **Firebase 프로젝트 연결 확인**
   ```bash
   firebase projects:list
   ```

2. **빌드 및 배포**
   ```bash
   npm run deploy
   ```

### 일반 배포
```bash
npm run deploy
```

## 사용 가능한 명령어

- `npm run dev` - 개발 서버 실행
- `npm run build` - 프로덕션 빌드
- `npm run export` - 정적 파일 내보내기 (빌드와 동일)
- `npm run deploy` - pubgsearch.web.app에 빌드 후 배포
- `npm run firebase:login` - Firebase 로그인
- `npm run firebase:deploy` - pubgsearch.web.app에 배포만 실행
- `npm run deploy:all` - 모든 호스팅 사이트에 배포

## 환경 설정

1. **환경변수 설정**
   - `.env.local` 파일 생성
   - `.env.example` 파일 참고하여 API 키 설정

2. **PUBG API 키 설정**
   ```env
   PUBG_API_KEY=your_actual_api_key_here
   ```

## 배포 후 확인사항

1. **사이트 접속 확인**
   - https://pubgsearch.web.app
   - https://micro-mining.web.app (기본 Firebase 도메인)

2. **API 동작 확인**
   - 플레이어 검색 기능
   - 매치 데이터 로드 기능

## 문제 해결

### 빌드 오류 시
```bash
npm run lint
npm run build
```

### 배포 오류 시
```bash
firebase login --reauth
firebase deploy --debug
```

### API 키 오류 시
- Firebase Console에서 환경변수 설정 확인
- .env.local 파일의 API 키 형식 확인

### CORS 오류 해결 (중요!)

**CORS 오류 발생 시 해결 방법:**

1. **임시 해결책 - CORS Proxy 사용**
   - `.env.local` 파일에 추가:
   ```env
   NEXT_PUBLIC_USE_CORS_PROXY=true
   ```
   - 재배포 후 테스트

2. **브라우저 확장프로그램 사용 (개발자용)**
   - "CORS Unblock" 또는 "CORS Everywhere" 확장프로그램 설치
   - 개발/테스트 목적으로만 사용

3. **권장 해결책 - 서버사이드 프록시**
   - Vercel, Netlify Functions 사용
   - 또는 별도의 백엔드 서버 구축

**CORS 에러 확인 방법:**
- 브라우저 콘솔에서 "CORS" 관련 에러 메시지 확인
- Network 탭에서 Preflight 요청 실패 확인

**주의사항:**
- CORS Proxy는 속도가 느리고 안정성이 떨어질 수 있음
- 프로덕션에서는 안정적인 백엔드 구축 권장

## 커스텀 도메인 설정 (선택사항)

1. Firebase Console > Hosting > 도메인 추가
2. `pubgsearch.web.app` 도메인 연결
3. DNS 설정 완료 후 SSL 인증서 자동 발급

## 성능 최적화

현재 설정된 최적화:
- 정적 파일 캐싱 (1년)
- 이미지 최적화 비활성화 (정적 호스팅용)
- Gzip 압축 자동 적용
- CDN 배포