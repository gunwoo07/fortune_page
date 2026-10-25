# 🌟 페이지 부적 (Fortune Page MVP)

수능 수험생이 모바일 웹에서 숫자 하나를 선택하면 당일 운세를 확인하고, 고정 URL과 카드 이미지로 공유할 수 있는 모바일 웹 서비스입니다.

---

## 🚀 오늘의 주요 구현 내용 (`feat/fortune_engine`)

- **백엔드 엔진 구현 (`lib/fortune.ts`)**: 한국 시간 기준 날짜 및 D-day 계산 로직, `getFortune` 순수 함수 완성[cite: 1, 2].
- **콘텐츠 데이터 분리 (`content/fortunes.ts`)**: D-day 구간별(`D-60+`, `D-59~30`, `D-29~7`, `D-6~1`, `D-day`) 개인 운세 문구 및 날짜별 공통 응원 문구 구조화[cite: 1, 2].
- **타입 안정성 강화**: **`package.json`** 파일에 **`typecheck`** (`tsc --noEmit`) 스크립트 추가 및 프로덕션 빌드 검증 완료.

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