# 🌟 페이지 부적 (Fortune Page MVP)

수능 수험생이 모바일 웹에서 숫자 하나를 선택하면 당일 운세를 확인하고, 고정 URL과 카드 이미지로 공유할 수 있는 모바일 웹 서비스입니다.

---

## 백엔드 개발 현황

- 날짜/D-day 로직은 `lib/date.ts`, 캠페인 시험일과 시작일 설정은 `config/campaign.ts`에서 관리합니다.
- 캠페인 기간은 시험일 두 달 전인 `2026-09-19`부터 시험일인 `2026-11-19`까지입니다. 설정은 `config/campaign.ts`에서 관리합니다.
- `getFortune(date, digit)`은 실제 날짜, 숫자 범위, 캠페인 기간을 검증한 뒤 결과를 반환합니다. 잘못된 입력은 `FortuneInputError.code`로 구분합니다.
- 공유 경로는 `getFortune` 호출 전에 `validateFortuneDate(date, today)`를 호출해야 합니다. 이 함수가 과거 공유 날짜는 허용하고 미래 및 시험 이후 날짜를 각각 구분합니다.
- `content/assignments.generated.ts`에는 캠페인 62일의 숫자별 키워드 배정이 저장되어 있습니다. `npm run generate:assignments`로 같은 표를 다시 만들 수 있습니다.
- 키워드 10개마다 5개 D-day 구간과 시험 당일 문구가 있고, 매일 공통 응원도 고정되어 있습니다.
- `npm run validate:content`는 날짜 누락, 하루 내 중복 키워드, 전날과 같은 숫자-키워드 배정, 콘텐츠 누락/중복, 생성 결과와 저장 파일의 차이를 검사합니다.

## 결과 계약과 사용 흐름

프런트엔드는 엔진 내부 배정 규칙을 구현하지 않고 결과 데이터만 화면에 표시합니다.

1. 홈 화면은 `getSeoulDateString()`으로 오늘 날짜를 구하고, 공유 경로는 URL에서 날짜를 읽습니다.
2. `validateFortuneDate(date, today)`가 오류 코드를 반환하면 해당 상태 안내를 보여 줍니다.
3. 검증을 통과한 날짜와 0~9 숫자를 `getFortune(date, digit)`에 전달합니다.
4. 반환되는 `FortuneResult`의 날짜, 숫자, D-day, 개인 문구, 공통 문구, 결과 ID를 화면에 표시합니다.

프런트엔드에서 사용할 함수와 타입은 한 모듈에서 가져올 수 있습니다.

```ts
import {
  getFortune,
  getSeoulDateString,
  validateFortuneDate,
  type FortuneResult,
} from "@/lib/fortune-api";

const today = getSeoulDateString();
const date = today; // 공유 결과 페이지에서는 URL의 YYYY-MM-DD 값을 사용
const dateError = validateFortuneDate(date, today);

if (dateError) {
  // invalid-date, invalid-today, before-campaign,
  // future-date, campaign-ended 중 상태에 맞는 안내를 표시
} else {
  const result: FortuneResult = getFortune(date, selectedDigit);
  // result.personalMessage와 result.commonMessage 등을 카드에 표시
}
```

`getFortune`은 `FortuneResult`를 반환합니다. 날짜·숫자·기간 입력이 잘못되면 `FortuneInputError`가 발생하며 `error.code`로 구분합니다. 내부 키워드는 결과 타입에 포함하지 않으므로 사용자 화면에 노출되지 않습니다.

이 경계를 두면 UI가 바뀌어도 날짜 계산과 콘텐츠 배정은 그대로 재사용할 수 있고, 같은 입력 결과를 홈과 공유 경로에서 동일하게 표시할 수 있습니다.

현재 이 브랜치에서는 결과 계약을 별도 진입점과 통합 테스트로 검증했습니다. 다만 `app/page.tsx`는 아직 시작 템플릿이므로 실제 화면에서 호출하는 연결은 프런트엔드 담당 작업으로 남아 있습니다.

## 검증 명령

```bash
npm test
npm run validate:content
npm run generate:assignments
npm run lint
npm run typecheck
npm run build
```

---

## 📂 프로젝트 폴더 구조

```text
app/
  layout.tsx                 # 공통 레이아웃과 기본 메타데이터
  page.tsx                   # 오늘의 입력 화면 (홈)
  r/[date]/[digit]/page.tsx  # 공유 결과 화면
  r/[date]/[digit]/opengraph-image.tsx # 공유 미리보기 이미지[cite: 1]
components/                  # 화면에서 재사용하는 UI 컴포넌트[cite: 1]
content/                     # 운세·응원 문구와 배정 데이터 (`fortunes.ts`)[cite: 1, 2]
lib/                         # 날짜 계산 및 운세 조회 엔진 (`fortune.ts`, `date.ts`)[cite: 1, 2]