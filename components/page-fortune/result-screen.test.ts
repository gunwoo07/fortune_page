import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { getFortune } from "../../lib/fortune-api";
import { ResultScreen } from "./result-screen";
import { StateScreen } from "./state-screen";

// 실제 엔진의 결과를 사용하되 라우트/OG를 대신 구현하지는 않습니다.
describe("result component contract", () => {
  it("renders B's result on the server without a browser environment", () => {
    const result = getFortune("2026-10-25", 8);
    const html = renderToStaticMarkup(createElement(ResultScreen, {
      result,
      sharePath: `/r/${result.date}/${result.digit}`,
    }));

    expect(html).toContain("D-25");
    expect(html).not.toContain("10월 25일");
    expect(html).toContain(result.personalMessage);
    expect(html).toContain(result.commonMessage);
    expect(html).toContain("결과 공유하기");
    expect(html).not.toContain("디자인 미리보기");
    expect(html).not.toContain("키워드");
  });
});

describe("state screen presentation", () => {
  it.each([
    ["closed", "운영 종료"],
    ["not-started", "곧, 첫 페이지를 펼쳐요"],
    ["invalid", "페이지를 찾지 못했어요"],
  ] as const)("renders the %s notice without an input form", (kind, title) => {
    const html = renderToStaticMarkup(createElement(StateScreen, { kind }));
    expect(html).toContain(title);
    expect(html).not.toContain("<form");
  });
});
