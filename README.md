# 페이지 부적 (Fortune Page MVP)

수능 수험생이 오늘의 페이지 끝자리 숫자를 선택해 짧은 개인 운세와 공통 응원을 확인하는 모바일 웹 서비스입니다. 결과 공유 기능은 MVP 목표이며, 현재 프런트엔드 화면과 공유 경로는 아직 구현 중입니다.

## 시작하기

### 요구 사항

- Node.js 및 npm

### 설치 및 개발 서버 실행

```bash
npm install
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 엽니다. 현재 홈 화면은 Next.js 시작 템플릿이며, 운세 엔진은 구현되어 있지만 화면과 연결되지는 않았습니다.

## 현재 구현 상태

- `lib/date.ts`: 한국 시간 기준 날짜, D-day 계산, 캠페인 날짜 검증
- `config/campaign.ts`: 캠페인 기간 설정. 현재 `2026-09-19`부터 시험일 `2026-11-19`까지입니다.
- `lib/assignments.ts`, `content/assignments.generated.ts`: 62일 동안 숫자 0~9에 키워드를 배정합니다. 하루 안에 키워드는 중복되지 않고, 같은 숫자의 키워드는 전날과 다릅니다.
- `content/keywords.ts`, `content/fortunes.ts`: 키워드 및 D-day 구간별 개인 운세와 날짜별 공통 응원
- `lib/fortune.ts`: 날짜와 숫자로 운세 결과를 생성하는 엔진
- `lib/fortune-api.ts`: 프런트엔드에서 사용할 엔진 함수와 타입의 진입점
- `lib/*.{test.ts}`: 날짜·엔진·배정·콘텐츠·결과 계약 테스트

숫자와 날짜가 같으면 같은 결과가 반환됩니다. 내부 키워드는 결과 객체에 포함하지 않습니다. 공유 URL과 OG 미리보기 등 사용자 대상 프런트엔드 흐름은 아직 구현되지 않았습니다.

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

배정표를 수정하거나 재생성한 뒤에는 `npm run validate:content`와 `npm test`를 실행하세요.

## 프로젝트 구조

```text
app/
  layout.tsx
  page.tsx
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
scripts/
  generate-assignments.ts
  validate-content.ts
```

공유 결과 경로, OG 이미지, 재사용 UI 컴포넌트는 아직 추가되지 않았습니다.

## Next.js 참고 자료

- [Next.js 문서](https://nextjs.org/docs)
- [Next.js 시작하기](https://nextjs.org/learn)
- [Next.js 배포 문서](https://nextjs.org/docs/app/building-your-application/deploying)
