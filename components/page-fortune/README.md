# A 프런트엔드 검토 가이드

## 이번 작업의 범위

- 작업 브랜치: `feat/fancyui`.
- 사용자 승인에 따라 B 코드가 반영된 `origin/main`을 이 브랜치에 병합했습니다. A를 `main`에 병합한 것은 아닙니다.
- B의 `lib/`, `config/`, `content/`, `scripts/`, 패키지/lockfile은 `origin/main`과 동일하게 유지합니다.
- **A는 홈·입력·결과 UI·공유 상호작용·상태 화면을 담당합니다. `/r/[date]/[digit]`와 OG는 B 담당으로 남겨뒀습니다.**
- 기존 `preview` query 분기와 고정 예시 데이터를 제거했습니다. 홈에 날짜/운세 예시를 실제 동작처럼 보여주지 않습니다.

## 먼저 알아둘 미완성 연결

현재 이 브랜치에는 B의 실제 결과 라우트가 없습니다. 숫자를 확인하면 올바른 `/r/YYYY-MM-DD/숫자`로 이동하지만, **B가 라우트를 연결하기 전에는 404가 나옵니다.** 이는 전체 서비스 완성이 아니라 A 영역의 인계 상태입니다.

결과 화면과 공유 기능은 B의 실제 `FortuneResult`를 넣은 저장소 밖의 독립 테스트 화면에서 확인했습니다. 검증을 위해 제품 소스에 임시 결과 라우트나 캡처 코드를 추가하지 않았습니다.

## 계획서와 실제 파일의 대응

계획서가 허용한 `components/` 안에 화면과 해당 화면에서만 사용하는 보조 코드를 모았습니다. 필요한 책임만 분리했고, B 담당 폴더를 새로 만들거나 덮어쓰지 않았습니다.

```text
app/
  page.tsx                       A: 실제 날짜 기반 입력/상태 화면
  r/[date]/[digit]/               B가 연결할 영역 — 아직 없음
components/page-fortune/
  home-view.ts                   B의 날짜 검증 결과 → A 화면 상태
  home-input.tsx                 입력 대기·실패 안내, 홈 갱신
  home-actions.ts                홈 제출 Server Action → 정규 결과 경로로 이동
  input-screen.tsx               숫자 입력 폼과 검증 안내
  result-screen.tsx              서버 렌더링 결과 본문
  result-actions.tsx             브라우저 공유·링크 복사·저장 버튼
  card-image.ts                  서비스용 PNG 생성·다운로드
  card-layout.ts                 PNG 줄바꿈·높이 계산
  state-screen.tsx               시작 전·종료·오류 안내
  ui-model.ts                    숫자 입력 검증과 D-day 표시
  page-fortune.module.css        화면별 스타일과 반응형
  *.test.ts                      위 계약과 화면에 대한 Vitest 테스트
  README.md                      이 문서
public/
  illustrations/                 손그림 SVG 두 개
  fonts/                         로컬 한글 폰트와 OFL 라이선스
lib/, config/, content/, scripts/ B의 기존 구현 — A에서 수정하지 않음
```

`preview-input.tsx`, `preview-fixture.ts`는 삭제했습니다. 기존 Node 전용 `ui-model.test.mjs`는 B의 `npm test`와 함께 실행되도록 Vitest의 `ui-model.test.ts`로 옮겼습니다.

## 추천 리뷰 순서

### 1. `app/page.tsx` → `home-view.ts`

```text
GET /
  → connection(): 요청 시점에 실행
  → B의 getSeoulDateString(): 한국 날짜
  → B의 validateFortuneDate(today, today)
  → A의 화면 상태로 변환
      active      → HomeInput
      not-started → StateScreen
      closed      → StateScreen
      invalid     → StateScreen
```

`home-view.ts`는 캠페인 규칙을 새로 정의하지 않습니다. B가 반환한 오류 코드를 화면 이름에 대응시키고, 정상일 때 B의 `calculateDday()` 값을 전달합니다. 날짜를 빌드 시점에 고정하지 않도록 서버의 요청 경계를 명시했습니다.

### 2. `home-input.tsx` → `input-screen.tsx` → `home-actions.ts`

- `InputScreen`은 경로를 모르고, 유효한 숫자만 `onConfirm`으로 전달합니다.
- 빈 값·여러 자리·문자·전각 숫자를 거절하며 `0`은 정상 입력입니다.
- 요청 중 버튼을 잠그고, 통신 실패는 폼의 안내 영역에 표시합니다.
- `HomeInput`은 Server Action인 `submitDigit()`을 호출합니다.
- `submitDigit()`은 입력 숫자를 서버에서 재검증하고, **제출 시점의 한국 날짜와 운영 상태를 다시 확인**합니다.
- 운영 중이면 `/r/날짜/숫자`로, 시작 전/종료 상태면 `/`로 이동합니다.
- 서버 날짜를 기준으로 하므로 자정 전에 연 폼이나 잘못 설정된 기기 시계로 전날 결과를 새로 만들지 않습니다.
- 열린 탭은 30초마다, 다시 돌아온 탭은 즉시 서버 화면을 갱신합니다. 화면 갱신 지연과 무관하게 제출 날짜는 서버에서 바로 재검증합니다.

### 3. `result-screen.tsx` → `result-actions.tsx`

`ResultScreen`은 서버에서 렌더링할 수 있는 컴포넌트입니다. B가 다음 두 props를 전달하면 됩니다.

```tsx
<ResultScreen
  result={result} // 기존 lib/types.ts의 FortuneResult
  sharePath={`/r/${result.date}/${result.digit}`}
/>
```

- 본문에는 D-day·개인 운세·공통 응원과 그림을 표시하며 내부 키워드는 표시하지 않습니다.
- 이 컴포넌트는 `getFortune()`을 호출하거나 OG를 생성하지 않습니다.
- 브라우저 API는 하위 `ResultActions`의 클릭 처리에만 둡니다.
- Web Share 미지원/실패 → 링크 복사, 클립보드 거절 → 수동 복사 입력칸 순으로 대체합니다.
- 공유 취소는 오류로 표시하거나 자동 복사하지 않습니다.

### 4. `card-image.ts` → `card-layout.ts`

- 서비스 기능인 결과 카드 PNG 저장 코드입니다. 검증용 화면 캡처 코드가 아닙니다.
- Canvas로 글·SVG 그림을 그리므로 버튼이나 조작 UI가 이미지에 들어가지 않습니다.
- 한글 폰트 로딩을 기다리고, 실제 글자 너비를 측정해 줄바꿈합니다.
- 기본 폭 1200px, 기본 높이 2400px이며, 긴 문구는 높이를 늘려 그림/꼬리말이 잘리지 않게 합니다.
- 화면 CSS와 Canvas는 별도 표현이므로 디자인 변경 시 양쪽을 함께 확인해야 합니다.

## 테스트 결과와 재실행

```bash
export PATH="$HOME/.local/bin:$PATH"
npm ci
npm run lint
npm run typecheck
npm test
npm run validate:content
npm run build
npm run start -- --hostname 127.0.0.1
```

- Vitest: B 엔진 검사 포함 **73개 통과**.
- lint, typecheck, 콘텐츠 검증, 프로덕션 빌드 통과.
- 별도의 브라우저 검사 **73개 통과**: 실제 홈 D-day, 0~9 제출 경로, 입력 오류, 폐기한 preview 파라미터 무시, 실제 클립보드, 공유 대체·취소·실패, PNG 다운로드/오류, 시작 전·시험 당일·종료 화면 포함.
- 화면 폭 320/390/1366/1920/2560px에서 가로 넘침을 확인했습니다.
- 짧은 카드 PNG 1200×2400, 긴 카드 PNG 1200×4608을 실제 다운로드해 확인했습니다.
- B 결과 라우트 미구현으로 발생하는 404는 **통합 미완료로 명시**하고 테스트했습니다. 결과 페이지가 동작한다고 보고하지 않습니다.
- 독립 코드 리뷰에서도 A 범위의 보안·로직 오류가 발견되지 않았습니다. 개선 제안은 공유/클립보드/이미지 실패 같은 클라이언트 분기를 CI에서 재현할 회귀 테스트를 추가하는 것입니다. 해당 분기는 저장소 밖의 실제 브라우저 검사로 검증했지만, 현재 체크인된 Vitest 테스트가 그 브라우저 검사를 대체하지는 않습니다.
- 실기기 iOS/Android 공유 시트와 배포된 OG/카카오톡 검증은 B의 라우트 통합 후 별도로 필요합니다.

## B에게 남기는 연결 항목

1. `app/r/[date]/[digit]/page.tsx`에서 날짜·숫자·기간/미래 날짜 검증 후 `getFortune()`으로 조회하고 `ResultScreen`을 호출합니다.
2. 잘못된 경로의 HTTP 상태와 안내 화면을 결정합니다. UI는 `StateScreen`을 재사용할 수 있습니다.
3. 과거 공유 링크를 홈의 현재 종료 상태와 구분해 유지하고, 결과 페이지와 OG에서 같은 결과를 사용합니다.
4. 실제 서비스 도메인, 메타데이터와 OG를 연결합니다.
5. 기존 A 커밋의 `layout.tsx`(검색 제외/미리보기 기본 메타데이터)와 `next.config.ts`(CSS Module 로더 범위)를 공통 파일 소유자가 리뷰합니다. 이번 수정에서는 이 공통 파일을 추가 변경하지 않았습니다. 홈의 제목·설명만 `app/page.tsx`에서 설정했습니다.
6. `npm audit`에서 기존 개발 의존성인 Vitest 관련 3건(critical 2, moderate 1)이 보고됐습니다. 패키지 소유자와 별도 보안 업데이트 검토가 필요하며 A가 버전을 바꾸지 않았습니다.

## Git 검토 명령

```bash
git status --short --branch
git diff HEAD -- app/page.tsx components/page-fortune
git ls-files --others --exclude-standard
# B 소유 파일은 origin/main 대비 변경이 없어야 합니다.
git diff origin/main -- lib config content scripts package.json package-lock.json
```

테스트 자동화·독립 UI 테스트 화면·캡처 산출물은 저장소 밖에 보관합니다. 로컬 산출물은 `~/Downloads/page-fortune/a-review-20261025/`에 있고, 앱에 이 경로를 하드코딩하지 않았습니다.
