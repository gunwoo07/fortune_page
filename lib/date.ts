// 수능 시험일 설정 (예: 2026년 11월 19일)
const TARGET_DATE = '2026-11-19';

/**
 * 현재 한국 시간(Asia/Seoul) 기준의 'YYYY-MM-DD' 문자열을 반환하는 함수
 */
export function getSeoulDateString(): string {
  const now = new Date();
  
  // 브라우저나 서버의 위치와 상관없이 강제로 서울 시간대로 변환합니다.
  const options: Intl.DateTimeFormatOptions = {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  };

  const formatter = new Intl.DateTimeFormat('en-CA', options);
  return formatter.format(now); // 예: "2026-10-13" 형태의 문자열 반환
}

/**
 * 기준 날짜와 수능일 사이의 D-day를 계산하는 함수
 */
export function calculateDday(dateString: string): number {
  const target = new Date(TARGET_DATE);
  const current = new Date(dateString);

  // 날짜 데이터를 밀리초(ms) 단위의 숫자로 바꾼 뒤 하루 단위로 나눕니다.
  const diffTime = target.getTime() - current.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}