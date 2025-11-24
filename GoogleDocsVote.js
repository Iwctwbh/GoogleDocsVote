// ==UserScript==
// @name         google docs 投票
// @namespace    http://tampermonkey.net/
// @version      2025-11-21
// @description  示例：直接把目标 URL 写在 @match 中，脚本只在该 URL 下运行
// @author       You
// @match        https://docs.google.com/forms/d/e/1FAIpQLSeuLN1ItXMF9uDxH_Q7Q6jihM5pxMHeo1N4R5bZRaJ-3tIIFg/*
// @match        https://docs.google.com/forms/u/0/d/e/1FAIpQLSeuLN1ItXMF9uDxH_Q7Q6jihM5pxMHeo1N4R5bZRaJ-3tIIFg/*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    function onReady(fn) {
        if (document.readyState !== 'loading') return fn();
        document.addEventListener('DOMContentLoaded', fn, { once: true });
    }

    const FIRST = ['James','John','Robert','Michael','William','David','Richard','Joseph','Thomas','Charles'];
    const LAST = ['Smith','Johnson','Williams','Brown','Jones','Garcia','Miller','Davis','Rodriguez','Martinez'];

    function randomName() {
        const f = FIRST[Math.floor(Math.random() * FIRST.length)];
        const l = LAST[Math.floor(Math.random() * LAST.length)];
        return `${f} ${l}`;
    }

    function randomSelect(argTarget) {
        const parent = [...document.querySelectorAll('span')].find(el => el.textContent.includes(argTarget));
        const labels = parent.querySelectorAll('.nWQGrd.zwllIb label');
        labels[Math.floor(Math.random() * labels.length)].click();
    }

    onReady(() => {
        // alert(`测试脚本 第${document.querySelectorAll("#lpd4pf")[0].textContent.match(/\d+/)[0]}页`);
        let json = JSON.parse(`{
    "nextPageCode": "下一页",
    "subbmitCode": "提交",
    "questions": {
        "2": "「御上先生」（TBS系）",
        "3": "松坂桃李「御上先生」（TBS系）",
        "4": "木村文乃「愛の、がっこう。」（フジテレビ系）"
    }
}`);

        if (document.querySelectorAll("#lpd4pf")[0].textContent.match(/\d+/)[0] == "1") {
            const el = document.querySelectorAll("input.whsOnd.zHQkBf")[0];
            if (el) {
                el.value = randomName();
                el.dispatchEvent(new Event('input', { bubbles: true }));
                el.dispatchEvent(new Event('change', { bubbles: true }));
            }

            randomSelect("10代");
            randomSelect("女性");
        }

        [...document.querySelectorAll('span')].filter(el => el.textContent.includes(json.questions[document.querySelectorAll("#lpd4pf")[0].textContent.match(/\d+/)[0]]))[1]?.closest(".nWQGrd.zwllIb label").click();
        setTimeout(() => {
            window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });
            setTimeout(() => {
                // [...document.querySelectorAll('span')].filter(el => el.textContent.includes(json.nextPageCode))[0]?.closest("div[role=button]")?.click();

                // [...document.querySelectorAll('span')].filter(el => el.textContent.includes("プライバシーポリシーを確認し、同意しました。"))[0]?.click();
                // [...document.querySelectorAll('span')].filter(el => el.textContent.includes(json.subbmitCode))[0].closest("div[role=button]")?.click();
            }, 1000);
        }, 1000);
    });
})();