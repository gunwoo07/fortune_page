# 🌟 페이지 부적 (Fortune Page MVP)

수능 수험생이 모바일 웹에서 숫자 하나를 선택하면 당일 운세를 확인하고, 고정 URL과 카드 이미지로 공유할 수 있는 모바일 웹 서비스입니다.

---

## 백엔드 개발 현황

- 날짜/D-day 로직은 `lib/date.ts`, 캠페인 시험일과 시작일 설정은 `config/campaign.ts`에서 관리합니다.
- `getFortune(date, digit)`은 운세 결과 데이터를 반환하고, `validateFortuneDate(date, today)`는 공유 경로에서 날짜가 실제 날짜인지, 미래/운영 종료 날짜인지 확인합니다.
- 캠페인 시작일은 아직 정해지지 않아 `CAMPAIGN_START_DATE`가 `null`입니다. 시작일이 정해지면 해당 설정을 채워 운영 전 날짜를 차단합니다.
- 일일 키워드 배정표와 전체 콘텐츠 검증은 아직 후속 작업입니다.

## 결과 계약과 사용 흐름

프런트엔드는 엔진 내부 배정 규칙을 구현하지 않고 결과 데이터만 화면에 표시합니다.

1. 화면 또는 결과 경로가 한국 날짜를 얻고 `validateFortuneDate(date, today)`를 호출합니다.
2. 오류 코드가 반환되면 코드에 맞는 미래 날짜/운영 종료/잘못된 날짜 안내를 표시합니다.
3. 검증을 통과한 날짜와 `0~9` 숫자를 `getFortune(date, digit)`에 전달합니다.
4. 반환되는 `FortuneResult`의 날짜, 숫자, D-day, 개인 문구, 공통 문구, 결과 ID를 화면에 표시합니다.

이 경계를 두면 UI가 바뀌어도 날짜 계산과 콘텐츠 배정은 그대로 재사용할 수 있고, 같은 입력 결과를 홈과 공유 경로에서 동일하게 표시할 수 있습니다.

## 검증 명령

```bash
npm test
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