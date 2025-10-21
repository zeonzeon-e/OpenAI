# TED English Companion (Front-end only)

React + TypeScript 실습용으로 제작한 TED 강연 분석 데모입니다. 붙여넣기 또는 프록시를 통해 전사를 불러오고, 브라우저에서 직접 LLM(OpenAI HTTP) 또는 로컬 모킹(LocalMockLLM/MSW)을 호출해 요약·문법·어휘 분석을 수행합니다.

## 주요 기능

- **입력 경로 2가지**: 전사 붙여넣기(자유 형식 / JSON) 및 TED URL + 선택적 CORS 프록시.
- **YouTube 플레이어 동기화**: 문장 클릭 시 해당 타임코드로 점프, 재생 위치에 따라 문장 하이라이트.
- **LLM 계층**: `LocalMockLLM`(기본)과 `OpenAIHTTP`(선택) 구현. 스키마 위반 시 재시도 후 원본 JSON 제공.
- **전처리 & Chunking**: 문장 분할, 토큰 수 추정, 가정법/조동사 등 규칙 기반 힌트 추출.
- **Zustand + TanStack Query**: 전역 옵션/상태, 분석 진행률, 재시도 제어.
- **MSW 모킹**: 개발 모드에서 프록시 및 OpenAI API 응답을 가짜 데이터로 반환.
- **Export**: 분석 결과 JSON / Vocabulary CSV / Anki TSV 다운로드.
- **테스트**: Vitest + React Testing Library 기반 기본 유닛 테스트.

## 빠른 시작

```bash
npm install
npm run dev
```

> **주의**: 샌드박스 환경에서는 npm 레지스트리 접근이 제한될 수 있습니다. 설치 실패 시 `msw`, `@tanstack/react-query` 등의 패키지를 직접 다운로드할 수 있는 네트워크 환경에서 설치해야 합니다.

### 개발 서버

1. `npm run dev`
2. `http://localhost:5173` 접속
3. 좌측 폼에서 전사를 붙여넣거나 **샘플 불러오기** 버튼 사용 → **분석 시작**

### 테스트 실행

```bash
npm run test
```

## 구조

```
src/
  app/App.tsx                 # 라우팅 및 전역 ErrorBoundary
  components/                 # Player, Panels, Transcript, Toolbar UI
  features/analyze/           # chunk/prompt/schema, LLM API, Zustand store, TanStack hook
  mocks/                      # MSW 핸들러 (OpenAI/Proxy 모킹)
  pages/Home.tsx              # 주요 UI 조합
  tests/analyze.spec.tsx      # vitest 시나리오
```

## 브라우저에서 OpenAI 호출 시 주의사항

- API Key는 로컬스토리지에 암호화 없이 저장됩니다.
- 네트워크 탭에 헤더가 그대로 노출되므로 **실제 서비스에서는 절대 사용 금지**.
- README와 UI 배너에 경고 문구를 명시했습니다.

## 한계 및 서버 확장 포인트

- **저작권/정책**: TED 전사/영상은 이용 약관을 준수해야 합니다. 실제 서비스에서는 서버 단에서 정식 API 또는 허용된 데이터만 사용하세요.
- **보안**: API Key 보호를 위해 백엔드 프록시(토큰 교환, rate limiting, 로깅) 설계가 필요합니다.
- **성능**: 현재는 청크별 직렬 요청만 수행합니다. 대용량 전사에 대해서는 Web Worker 기반 전처리, 백오프 전략, 스트리밍 UI를 추가할 수 있습니다.
- **데이터 품질**: LocalMockLLM 응답은 데모용입니다. 실제 모델을 사용할 경우 스키마 검증 실패 시 서버에서 재요청하거나 UI에서 편집 워크플로를 확장해야 합니다.

## 라이선스 및 참고

- 본 저장소는 학습/데모 목적이며, TED/YouTube 콘텐츠 사용 시 원저작권자의 정책을 반드시 확인하세요.
- React, Vite, Tailwind, Zustand, TanStack Query, MSW, Vitest 등을 활용했습니다.
