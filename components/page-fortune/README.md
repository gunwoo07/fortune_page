# 페이지 부적 — A 프런트엔드 인계

작업 브랜치: `feat/fancyui`. 사용자 제공 입력/결과 스케치를 기준으로 한 UI입니다.

## 검토 시작점과 현재 Git 상태

- 브랜치: `feat/fancyui`. UI 변경은 작업 트리에 있으며 아직 스테이징·커밋·푸시하지 않았습니다.
- `origin/main`은 브랜치 복사 때 함께 복사된 upstream 설정입니다. `main`을 수정한 것이 아닙니다.
- 검토 요청 시 실행 중이던 프로덕션 서버를 종료했고, 로컬 3000번 포트가 닫힌 것을 확인했습니다.
- 먼저 이 문서의 파일 지도와 데이터 흐름을 읽고 `app/page.tsx` → `preview-input.tsx` → `input-screen.tsx` → `result-screen.tsx` 순서로 보면 됩니다.
- 검토 중 명령을 실행하면 Git 상태나 서버 상태가 바뀔 수 있으므로 위 내용은 인계 시점 기준입니다.

## 수정·추가 파일 지도

### 기존 파일 수정

- `app/page.tsx`: 기본 Next 시작 화면을 디자인 미리보기 진입점으로 교체. 서버에서 query를 읽고 입력·결과·상태 화면을 선택합니다. `Suspense`는 비동기 `searchParams` 접근을 감쌉니다.
- `app/globals.css`: 전역 배경·기본 여백·폰트·밝은 색상 모드 지정. 세부 화면 스타일은 CSS Module에 분리했습니다.
- `app/layout.tsx`: 한국어 문서 언어, 미리보기 메타데이터와 검색 제외 설정, 외부 Geist 폰트 제거. 공통 파일이므로 B의 리뷰가 필요합니다.
- `next.config.ts`: Tailwind 로더 범위를 전역 CSS로 제한. CSS Module 클래스 매핑이 사라지는 문제를 수정한 공통 설정 변경입니다.

### 새 파일

```text
components/page-fortune/
  README.md                 이 검토·인계 문서
  input-screen.tsx          입력 폼, 입력값/오류 상태, 숫자 검증
  preview-input.tsx         입력 화면과 Next router를 연결하는 Client wrapper
  preview-fixture.ts        실제 엔진과 분리된 고정 예시 데이터
  result-screen.tsx         결과 문구, 공유, 복사, PNG 저장
  state-screen.tsx          운영 종료/시작 전/잘못된 입력 안내 화면
  ui-model.ts               입력 검증과 D-day 표시용 순수 함수
  ui-model.test.mjs         위 순수 함수의 Node 단위 테스트
  page-fortune.module.css   화면 간격·글자·버튼·반응형 스타일
  qa-browser.py             Hermes 브라우저 환경에서 실행하는 UI 검증
public/
  illustrations/page-wave.svg    손을 흔드는 캐릭터
  illustrations/page-clover.svg  클로버를 든 캐릭터
  fonts/page-korean.woff2        로컬 한글 웹폰트
  fonts/OFL.txt                  폰트 라이선스
```

## 구조와 데이터 흐름

```text
GET /
  app/page.tsx [Server + Suspense]
    └─ PreviewInput [Client: 라우터와 pending 상태]
         └─ InputScreen [Client: 입력값·오류 상태]
              └─ parseDigit(value)
                   ├─ 유효하지 않음 → 오류 안내, 입력칸 포커스
                   └─ 0~9 → onConfirm(digit)
                        └─ router.push('/?preview=result&digit=숫자')

GET /?preview=result&digit=8
  app/page.tsx [Server: query 검사]
    ├─ 숫자 오류 → StateScreen(kind='invalid')
    └─ previewResult(8) → FortuneResult
         └─ ResultScreen [Client]
              ├─ 개인 운세·공통 응원·D-day 표시
              ├─ 공유 → navigator.share → 실패/미지원 시 링크 복사
              ├─ 복사 → Clipboard API → 거절 시 수동 복사 입력칸
              └─ 저장 → Canvas에 글·SVG 그림 → PNG 다운로드
```

- 서버 쪽은 화면 선택과 예시 데이터 전달만 합니다. 브라우저 API는 Client Component의 클릭 핸들러 안에서만 호출합니다.
- `InputScreen`은 경로를 모르고 `onConfirm`만 호출합니다. B가 실제 날짜를 붙이는 라우팅으로 교체하기 쉽게 분리했습니다.
- `ResultScreen`은 운세를 생성하지 않습니다. 기존 `FortuneResult`와 공유 경로를 받아 렌더링합니다.
- 날짜 계산·키워드 배정·운영 정책을 A의 화면 코드에 중복 구현하지 않았습니다.

## 코드 검토 체크포인트

1. **데모와 실제 서비스의 경계:** `preview-fixture.ts`의 날짜·D-40은 고정 예시입니다. 출시 시 홈을 실제 엔진으로 연결하고 미리보기 메타데이터/noindex 정책을 재검토해야 합니다.
2. **입력:** `0`이 유효한지, 빈 값·여러 자리·문자·전각 숫자가 거절되는지 확인하세요. 에러 메시지와 `aria-invalid`, 입력칸 포커스를 함께 처리합니다.
3. **공유:** 권한 거절이나 미지원 환경에서 성공했다고 표시하지 않는지, 수동 복사 대체 수단이 있는지 확인하세요. 네이티브 공유 취소는 오류로 표시하지 않습니다.
4. **이미지 저장:** 화면을 그대로 캡처하는 라이브러리가 아니라 Canvas로 별도 구성합니다. 그래서 화면 스타일을 바꾸면 저장 이미지 쪽 간격/폰트도 함께 검토해야 합니다. 긴 문구의 고정 높이 제한은 아래 알려진 제한을 참고하세요.
5. **공통 변경:** `layout.tsx`와 `next.config.ts` 변경 이유를 우선 확인하세요. 패키지/lockfile 변경은 없습니다.
6. **넓은 화면:** 화면 전체를 늘리는 방식이 아니라 콘텐츠를 최대 400px로 중앙 정렬합니다. 낮은 화면에서는 세로 스크롤이 정상 동작입니다.
7. **남은 통합:** B의 실제 `/r` 경로와 OG는 아직 없습니다. 현재 오류 preview 화면의 HTTP 200을 실제 오류 라우트 정책으로 오해하지 마세요.

### diff 확인 명령

```bash
cd /home/hermespi/projects/fortune_page
git status --short --branch
git diff -- app/page.tsx app/globals.css app/layout.tsx next.config.ts
git ls-files --others --exclude-standard
```

새 파일은 미추적 상태이므로 기본 `git diff`에 나오지 않습니다. 새 컴포넌트는 에디터에서 직접 열어 확인하세요. 검토를 위해 임의로 스테이징하거나 커밋할 필요는 없습니다.

## 현재 동작과 범위

- `/`: 숫자 한 자리 입력 → 확인 → 결과 미리보기.
- `/?preview=result&digit=8`: 재접속 가능한 디자인 미리보기 링크. **실제 `/r/날짜/숫자` 결과 링크가 아닙니다.**
- `/?preview=closed`, `/?preview=not-started`, `/?preview=invalid`: 운영 종료·시작 전·오류 화면.
- 흰 배경, 큰 D-day, 손그림 SVG 캐릭터, 회색 입력칸/버튼. 초록색은 클로버에만 사용합니다.
- 공유 API, 클립보드 복사 및 권한 거절 시 수동 복사, 클라이언트 PNG 저장.
- PNG는 1200×2400이고 버튼이 포함되지 않습니다. 미리보기 이미지에는 예시임을 명시합니다.
- 키워드·등급은 화면에 표시하지 않습니다.

`preview-fixture.ts`의 D-40, 날짜, 문장은 **고정 디자인 예시**입니다. 모든 숫자에 같은 문구가 나오는 것이 의도된 미리보기 동작입니다. 실제 운세나 날짜 계산을 구현한 것이 아니며, 페이지 하단과 이미지에 명시했습니다. 외부 배포용 MVP로 간주하지 마세요.

## B가 연결할 계약

기존 `lib/types.ts`의 `FortuneResult`를 그대로 사용합니다. `lib/`, `config/`, `content/`, `data/`, `/r` 및 OG 라우트, `package.json`과 lockfile은 수정하지 않았습니다.

### 입력 화면

`InputScreen`은 다음 props만 필요합니다.

```tsx
<InputScreen
  dday={serverCalculatedDday}
  pending={pending}
  onConfirm={(digit) => {
    // Client wrapper에서 router.push(`/r/${serverCalculatedDate}/${digit}`)
  }}
/>
```

- `onConfirm`은 클라이언트 콜백입니다. Server Component에서 함수를 직접 전달하지 말고, 현재 `preview-input.tsx` 같은 Client wrapper에서 라우팅하세요.
- A의 `parseDigit`은 입력칸 표시 검증일 뿐입니다. B는 실제 공유 경로의 날짜·숫자를 서버에서 별도로 검증해야 합니다.
- 서버가 계산한 날짜·D-day를 함께 전달하고, 날짜가 바뀔 때 새로고침/갱신 정책을 적용하세요. A는 한국 자정 계산이나 캠페인 설정을 중복 구현하지 않았습니다.

### 결과 화면

B의 서버 결과 라우트에서 검증된 데이터를 넘기면 됩니다.

```tsx
<ResultScreen
  result={result}
  sharePath={`/r/${result.date}/${result.digit}`}
/>
```

- `preview` 기본값은 `false`입니다. 실제 라우트에서는 지정하지 않습니다.
- `sharePath`는 B가 만든 검증된 canonical 경로입니다. 이 컴포넌트가 운세를 조회하거나 OG를 생성하지 않습니다.
- 결과 UI는 `personalMessage`, `commonMessage`, `dday`를 표시합니다. 저장 이미지에는 날짜·숫자도 들어갑니다.
- Web Share 미지원/실패 시 링크 복사로 대체합니다. 사용자가 공유를 취소하면 오류 메시지를 표시하지 않습니다.
- 브라우저 다운로드와 네이티브 공유의 최종 저장/수신 여부까지 사이트가 확인할 수는 없습니다.

### 운영 상태

```tsx
<StateScreen kind="closed" />
<StateScreen kind="not-started" />
<StateScreen kind="invalid" />
```

운영 기간·미래 날짜·잘못된 URL 정책과 HTTP 상태 코드는 B가 실제 라우트에서 결정합니다. 현재 preview 쿼리의 오류 화면은 시각적 예시이며 HTTP 200입니다.

## 공통 파일 변경 — B 리뷰 필요

- `app/layout.tsx`: 한국어 `lang`, 미리보기 제목/설명, `noindex`, 기존 외부 Geist 폰트 로딩 제거. 실제 출시 메타데이터와 `robots` 설정으로 교체해야 합니다.
- `app/globals.css`: 밝은 배경 고정, 기본 초기화, 로컬 한글 웹폰트 등록.
- `next.config.ts`: Tailwind 커스텀 로더 대상을 `*.css`에서 `globals.css`로 좁혔습니다. 기존 `as: '*.css'`가 CSS Module 파일까지 일반 CSS로 처리해 클래스 매핑이 비는 현상을 브라우저에서 재현했습니다. 수정 후 실제 클래스명과 D-day 60px 적용을 확인했습니다.
- `public/fonts/page-korean.woff2`: Noto Sans KR 가변 폰트의 한글/라틴/기본 문장부호 서브셋. SIL OFL 라이선스는 같은 폴더 `OFL.txt`에 동봉. 외부 폰트 요청 없이 한글을 표시합니다.
- 현재 폰트 서브셋은 전체 한자를 포함하지 않습니다. 콘텐츠에 한자를 도입하면 폴백/서브셋을 다시 검토하세요.

## 검증

패키지 스크립트 소유권을 유지하기 위해 `package.json`에 명령을 추가하지 않았습니다.

```bash
export PATH="$HOME/.local/bin:$PATH"
npm run lint
npx tsc --noEmit
node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON --test components/page-fortune/ui-model.test.mjs
npm run build
npm run start -- --hostname 127.0.0.1
```

- lint, TypeScript, 단위 테스트 2개, 프로덕션 빌드 통과.
- 실제 프로덕션 서버에서 브라우저 체크 70개 통과. 숫자 0~9, 빈 값·복수 자리·문자, 잘못된 preview URL, 재접속, PNG 다운로드, 실제 클립보드, 클립보드 거절, Web Share 미지원 대체, 운영 상태, 320/368/390/768/1280px 가로 넘침, runtime error 수집 포함.
- 넓은 데스크톱 화면은 1366×768, 1920×1080, 2560×1440에서 입력·결과 각각 확인했고, 별도로 숫자 입력→결과 이동을 확인했습니다. 가로 넘침 없음, 콘텐츠 400px 중앙 정렬, 이미지 정상 로딩을 검증했습니다.
- 브라우저 재실행용 `qa-browser.py`는 Hermes `browser_exec`의 helper가 주입된 환경에서 실행합니다. 일반 `python qa-browser.py` 용이 아닙니다. 실행 중 앱은 로컬 3000번 포트여야 합니다.
- PNG 저장 실제 파일과 한글 가독성은 이미지를 열어 확인했습니다.

산출물은 `~/Downloads/page-fortune/`에 저장됩니다.

- `01-input-mobile.png`, `02-result-mobile.png`, `03-closed-mobile.png`, `04-input-desktop.png`
- `page-fortune-preview-2026-10-10-0.png`: 저장 버튼으로 내려받은 카드
- `qa-results.json`: 각 브라우저 체크 결과

## 남은 검증과 알려진 제한

- 독립 코드 리뷰에서 현재 미리보기 범위의 보안/로직 오류는 발견되지 않았습니다. 비차단 제안: PNG는 고정 높이이므로 B가 긴 문장을 도입하면 줄 수에 따른 높이 계산 또는 콘텐츠 길이 제한을 추가해야 합니다. 현재 짧은 예시 문구의 PNG는 잘림 없이 확인했습니다.
- 실제 iPhone Safari/Android Chrome, OS 공유 시트, 카카오톡 크롤러/OG는 B 통합 후 실제 기기와 배포 URL에서 확인해야 합니다. 데스크톱 Chromium 뷰포트 검사가 실기기 검사를 대신하지 않습니다.
- 엔진·실제 날짜·캠페인 종료 판정·공유 라우트·OG는 B 영역입니다.
- 기존 Next.js 16.4.0의 보안 취약점은 미해결입니다. 빌드가 보안 경고로 한 번 중단됐고 같은 명령 재실행에서 성공했습니다. 배포 전에 별도 검토/업데이트가 필요하며 A가 패키지 버전을 임의로 바꾸지 않았습니다.
