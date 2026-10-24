"""Run via browser_exec: exec(Path(this_file).read_text()).
Uses browser helpers supplied by the Hermes browser harness. No extra npm packages.
Writes real test results and screenshots to ~/Downloads/page-fortune/.
"""
import json
import time
import shutil
from pathlib import Path
from typing import Any, Callable

# Injected by browser_exec, annotated here for static analysis.
cdp: Callable[..., Any] = globals()["cdp"]
js: Callable[..., Any] = globals()["js"]
goto_url: Callable[..., Any] = globals()["goto_url"]
wait_for_load: Callable[..., Any] = globals()["wait_for_load"]
capture_screenshot: Callable[..., Any] = globals()["capture_screenshot"]
fill_input: Callable[..., Any] = globals()["fill_input"]

out = Path('/home/hermespi/Downloads/page-fortune')
out.mkdir(parents=True, exist_ok=True)
checks = []
cdp('Page.addScriptToEvaluateOnNewDocument', source='window.__qaErrors=[]; addEventListener("error",e=>window.__qaErrors.push(e.message)); addEventListener("unhandledrejection",e=>window.__qaErrors.push(String(e.reason)));')

def check(name, expression):
    passed = bool(js(expression))
    checks.append({'name': name, 'passed': passed})
    (out / 'qa-results.json').write_text(json.dumps(checks, ensure_ascii=False, indent=2))
    assert passed, name

def open_page(path='/'):
    goto_url('http://127.0.0.1:3000' + path)
    wait_for_load()
    time.sleep(.6)
    check('no runtime error on ' + path, 'Array.isArray(window.__qaErrors) && window.__qaErrors.length===0')

def click_text(text):
    js('(() => { const b=[...document.querySelectorAll("button,a")].find(b=>b.textContent===' + json.dumps(text) + '); if(!b) throw Error("Button missing"); b.click(); })()')
    time.sleep(.4)

def screenshot(name, width=368, height=900):
    cdp('Emulation.setDeviceMetricsOverride', width=width, height=height, deviceScaleFactor=1, mobile=True)
    time.sleep(.3)
    source = capture_screenshot()
    shutil.copy2(source, out / name)
    print('Screenshot:', out / name)

open_page()
check('input screen renders with working CSS modules', 'getComputedStyle(document.querySelector("h1")).fontSize==="60px"')
check('Korean document language', 'document.documentElement.lang==="ko"')
check('Korean font loaded', 'document.fonts.check(\'14px "Page Korean"\')')
click_text('확인')
check('empty submission shows error and focuses input', 'document.querySelector("[role=alert]").textContent.includes("0부터 9") && document.activeElement.id==="page-digit"')
for value in ['10', '-1', '1.5', 'a', '８']:
    fill_input('#page-digit', value)
    click_text('확인')
    check('invalid input rejected: ' + value, 'document.querySelector("input").getAttribute("aria-invalid")==="true"')
fill_input('#page-digit', '0')
click_text('확인')
time.sleep(1)
check('zero is a valid digit and reaches result', 'location.search.includes("digit=0") && document.querySelectorAll("section").length===2')
check('private and common messages are separate accessible sections', 'document.querySelectorAll("section[aria-label]").length===2')
check('preview result is clearly disclosed', 'document.body.innerText.includes("실제 운세가 아닙니다")')
check('no internal keyword labels', '!document.body.innerText.includes("키워드")')

cdp('Browser.setDownloadBehavior', behavior='allow', downloadPath=str(out))
click_text('이미지 저장')
time.sleep(2)
check('image download completed without UI error', 'document.querySelector("[role=status]").textContent.includes("다운로드 목록")')
files = list(out.glob('page-fortune-preview-*-0.png'))
checks.append({'name':'PNG file exists and has nonzero content','passed': bool(files) and files[0].stat().st_size > 5000})
assert checks[-1]['passed'], checks[-1]['name']

# Real Clipboard API, with explicit browser test permission.
cdp('Browser.grantPermissions', permissions=['clipboardReadWrite', 'clipboardSanitizedWrite'], origin='http://127.0.0.1:3000')
click_text('링크 복사')
check('clipboard reports successful copy', 'document.querySelector("[role=status]").textContent.includes("링크를 복사")')
check('clipboard contains reopenable preview link', 'navigator.clipboard.readText().then(t=>t.endsWith("/?preview=result&digit=0"))')

# Denied clipboard must expose selectable URL instead of a false success.
js('window.__originalClipboardWrite=navigator.clipboard.writeText; navigator.clipboard.writeText=()=>Promise.reject(new DOMException("Denied","NotAllowedError"))')
click_text('링크 복사')
check('denied clipboard exposes manual copy', '!!document.querySelector("input[readonly]") && document.querySelector("[role=status]").textContent.includes("선택해서")')
js('navigator.clipboard.writeText=window.__originalClipboardWrite')

# Unsupported Web Share falls back to a real clipboard copy.
js('window.__originalShare=navigator.share; navigator.share=undefined')
click_text('결과 공유하기')
check('unsupported Web Share falls back to clipboard', 'document.querySelector("[role=status]").textContent.includes("링크를 복사")')
js('navigator.share=window.__originalShare')

open_page('/?preview=result&digit=8')
first = js('[...document.querySelectorAll("section")].map(s=>s.textContent)')
open_page('/?preview=result&digit=8')
check('reopened preview URL reproduces same visible messages', '[...document.querySelectorAll("section")].map(s=>s.textContent).join("|")===' + json.dumps('|'.join(first)))
screenshot('02-result-mobile.png', height=1120)
for width in [320, 368, 390, 768, 1280]:
    cdp('Emulation.setDeviceMetricsOverride', width=width, height=900, deviceScaleFactor=1, mobile=True)
    check('result no horizontal overflow at ' + str(width), 'document.documentElement.scrollWidth<=innerWidth')

for mode in ['closed', 'not-started', 'invalid']:
    open_page('/?preview=' + mode)
    check(mode + ' state renders heading', '!!document.querySelector("h1") && !document.querySelector("#page-digit")')
    if mode == 'closed': screenshot('03-closed-mobile.png')
for digit in ['10', '-1', 'a', '', '8&digit=9']:
    open_page('/?preview=result&digit=' + digit)
    check('invalid URL digit safely handled: ' + digit, 'document.body.innerText.includes("페이지를 찾지 못했어요")')

open_page()
screenshot('01-input-mobile.png', height=920)
for width in [320, 368, 390, 768, 1280]:
    cdp('Emulation.setDeviceMetricsOverride', width=width, height=900, deviceScaleFactor=1, mobile=True)
    check('input no horizontal overflow at ' + str(width), 'document.documentElement.scrollWidth<=innerWidth')
screenshot('04-input-desktop.png', width=1280, height=950)
for digit in range(10):
    open_page()
    fill_input('#page-digit', str(digit))
    click_text('확인')
    time.sleep(.3)
    check('digit ' + str(digit) + ' reaches matching result URL', 'location.search.includes("digit=' + str(digit) + '") && document.querySelectorAll("section").length===2')

(out / 'qa-results.json').write_text(json.dumps(checks, ensure_ascii=False, indent=2))
print(json.dumps({'passed':sum(c['passed'] for c in checks),'total':len(checks),'output':str(out)}, ensure_ascii=False))
