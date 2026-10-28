# 페이지 부적 (Fortune Page MVP)

수능 수험생이 오늘의 페이지 끝자리 숫자를 선택해 짧은 개인 운세와 공통 응원을 확인하는 모바일 웹 서비스입니다. 결과 공유 경로와 결과별 공유 미리보기(OG)가 연결되어 있습니다.

## 시작하기

### 요구 사항

- Node.js 및 npm

### 설치 및 개발 서버 실행

```bash
npm install
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 엽니다. 홈에서 숫자를 입력하면 오늘의 결과 페이지로 이동합니다.

## 현재 구현 상태

- `lib/date.ts`: 한국 시간 기준 날짜, D-day 계산, 캠페인 날짜 검증
- `config/campaign.ts`: 캠페인 기간 설정. 현재 `2026-09-19`부터 시험일 `2026-11-19`까지입니다.
- `lib/assignments.ts`, `content/assignments.generated.ts`: 62일 동안 숫자 0~9에 키워드를 배정합니다. 하루 안에 키워드는 중복되지 않고, 같은 숫자의 키워드는 전날과 다릅니다.
- `content/keywords.ts`, `content/fortunes.ts`: 키워드 및 D-day 구간별 개인 운세와 날짜별 공통 응원
- `lib/fortune.ts`: 날짜와 숫자로 운세 결과를 생성하는 엔진
- `lib/fortune-api.ts`: 프런트엔드에서 사용할 엔진 함수, 공유 결과 검증 함수와 타입의 진입점
- `app/r/[date]/[digit]/page.tsx`: 공유 URL에서 날짜·숫자를 검증해 결과를 서버 렌더링
- `app/r/[date]/[digit]/opengraph-image.tsx`: 결과별 Open Graph 이미지 생성
- `lib/site-url.ts`: canonical URL과 공유 미리보기에 사용할 공개 사이트 주소
- `components/page-fortune/`: 홈 입력, 결과 및 오류 상태 화면과 공유 동작
- `lib/*.{test.ts}`: 날짜·엔진·배정·콘텐츠·결과 계약 테스트

숫자와 날짜가 같으면 같은 결과가 반환됩니다. 과거의 유효한 공유 링크는 재현되며, 미래 날짜와 잘못된 입력은 찾을 수 없음 안내로 처리합니다. 내부 키워드는 결과 객체에 포함하지 않습니다. 검색 색인은 출시 전까지 비활성화되어 있지만, 공유 크롤러용 메타데이터와 OG 이미지는 제공됩니다.

## 결과 엔진 사용법

프런트엔드는 `@/lib/fortune-api`에서 함수를 가져와 날짜를 검증한 다음 결과를 표시할 수 있습니다.

```ts
import {
  getFortune,
  getSeoulDateString,
  validateFortuneDate,
  type FortuneResult,
} from "@/lib/fortune-api";

const today = getSeoulDateString();
const date = today; // 공유 결과 화면에서는 URL에서 읽은 날짜를 사용합니다.
const dateError = validateFortuneDate(date, today);

if (dateError) {
  // 날짜 오류 코드에 맞는 안내 화면을 표시합니다.
} else {
  const result: FortuneResult = getFortune(date, selectedDigit);
  // 결과 카드에서 result.personalMessage 등을 표시합니다.
}
```

`validateFortuneDate`는 잘못된 날짜, 운영 시작 전 날짜, 미래 날짜, 운영 종료 날짜를 구분합니다. `getFortune`은 날짜·숫자·운영 기간 입력이 유효하지 않으면 `FortuneInputError`를 발생시키며, `error.code`로 원인을 확인할 수 있습니다.

## 개발 명령

```bash
npm test                    # 테스트 실행
npm run validate:content    # 콘텐츠와 배정표 검사
npm run generate:assignments # 배정표 재생성
npm run lint                # ESLint
npm run typecheck           # TypeScript 검사
npm run build               # 프로덕션 빌드
npm start                   # 빌드된 앱 실행
```

운영 사이트 주소는 Vercel 무료 제공 도메인인 `https://fortune-page-alpha.vercel.app`입니다. 운영 환경에서는 `SITE_URL`, `VERCEL_PROJECT_PRODUCTION_URL`, `VERCEL_URL` 순으로 주소를 선택하며, 앞의 환경변수가 없으면 선택한 운영 주소를 기본값으로 사용합니다. 다른 주소를 사용하려면 Vercel 프로젝트의 Production 환경 변수 `SITE_URL`에 공개 사이트 원본 주소를 지정하세요.

## 도메인 및 5일차 QA

- 최종 운영 주소는 `https://fortune-page-alpha.vercel.app`입니다. Vercel이 제공하는 도메인이므로 별도의 도메인 등록이나 DNS 레코드 설정은 필요하지 않습니다. 2026-10-28 확인 시 홈은 HTTP 200이었지만 `/r/2026-10-28/4`와 결과별 `opengraph-image` 경로는 HTTP 404였습니다. 공유 결과 경로를 제공하는 현재 저장소 버전을 Vercel 운영 배포에 반영한 뒤 다시 확인해야 합니다.
- 모바일·데스크톱 폭 320, 360, 390, 768, 1280px에서 홈과 결과 화면을 확인했고 가로 넘침은 없었습니다.
- 날짜 경계 테스트 15개, 전체 단위 테스트 89개, 콘텐츠 검증, ESLint, TypeScript 검사와 프로덕션 빌드가 통과했습니다.
- Vercel 미리보기 배포와 실제 iOS·Android 공유 검수는 계정·기기 확인이 필요해 남은 출시 전 작업입니다.

배정표를 수정하거나 재생성한 뒤에는 `npm run validate:content`와 `npm test`를 실행하세요.

## 프로젝트 구조

```text
app/
  r/[date]/[digit]/
    page.tsx
    not-found.tsx
    opengraph-image.tsx
  layout.tsx
  page.tsx
components/
  page-fortune/
config/
  campaign.ts
content/
  assignments.generated.ts
  fortunes.ts
  keywords.ts
lib/
  assignments.ts
  content-validation.ts
  date.ts
  fortune-api.ts
  fortune.ts
  site-url.ts
  shared-result.test.ts
  site-url.test.ts
scripts/
  generate-assignments.ts
  validate-content.ts
```

공유 결과 경로, 재사용 UI 컴포넌트, 결과별 OG 이미지와 메타데이터가 연결되었습니다.

## Next.js 참고 자료

- [Next.js 문서](https://nextjs.org/docs)
- [Next.js 시작하기](https://nextjs.org/learn)
- [Next.js 배포 문서](https://nextjs.org/docs/app/building-your-application/deploying)
