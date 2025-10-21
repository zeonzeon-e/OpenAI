# TED English Studio

프런트엔드만으로 TED 강연을 요약하고 문법/어휘 포인트를 추출하는 React + TypeScript 데모입니다. 붙여넣기된 트랜스크립트 또는 임시 CORS 프록시를 통해 가져온 HTML을 전처리한 뒤, 브라우저에서 직접 LLM API를 호출하거나 MSW 기반 Mock을 이용해 분석합니다.

## 주요 기능

- 붙여넣기 또는 URL + CORS 프록시 기반 트랜스크립트 수집
- YouTube 플레이어와 연동되는 문장/요약/문법/어휘 패널
- TanStack Query + Zustand로 상태 관리 및 요청 병렬화
- LLM 스키마 검증(Zod)과 JSON/CSV/TSV 내보내기
- Vitest + RTL + MSW로 UI 흐름 테스트

## 빠른 시작

```bash
npm install
npm run dev
```

Mock LLM이 기본값으로 동작하며, 개발 환경에서 자동으로 MSW가 구동됩니다.

## OpenAI API를 직접 사용할 때

- Settings 패널에서 `OpenAI HTTP`를 선택하고 API Key를 입력합니다.
- 키는 브라우저 `localStorage`에 저장되므로 공유된 환경에서는 사용하지 마세요.
- 실제 배포 시에는 서버 프록시/토큰 교환 등 추가 보안 계층이 필요합니다.

## TED URL 사용 시 주의 사항

- TED 사이트는 기본적으로 CORS를 차단합니다. `https://example.com/fetch?url=` 형태로 HTML을 중계해 주는 임시 프록시를 입력해야 합니다.
- 프록시가 없다면 트랜스크립트를 직접 붙여넣는 것이 가장 안전한 방법입니다.

## 테스트

```bash
npm test
```

Vitest가 jsdom 환경에서 렌더링 테스트를 수행하며, MSW 서버가 자동으로 모킹 응답을 제공합니다.

## 한계와 확장

- 트랜스크립트 및 영상 메타데이터는 사용자 입력에 의존합니다. 안정적인 서비스를 위해서는 백엔드 수집 파이프라인이 필요합니다.
- 브라우저에서 직접 LLM API를 호출하는 방식은 프로덕션 보안 요건을 충족하지 못합니다. 서버 프록시 혹은 토큰 기반 호출로 확장해야 합니다.
- 추가 학습 데이터를 축적하거나, 여러 LLM을 선택할 수 있도록 Provider 인터페이스를 확장할 수 있습니다.
