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

    function getFormId() {
        // URL like /forms/d/e/<FORM_ID>/...
        const m = location.pathname.match(/\/d\/e\/([^\/]+)/);
        return m ? m[1] : 'unknown_form';
    }

    function storageKeyBase() {
        return 'gd_vote_count_' + getFormId();
    }

    function getCount() {
        return parseInt(localStorage.getItem(storageKeyBase()) || '0', 10);
    }

    function setCount(n) {
        localStorage.setItem(storageKeyBase(), String(n));
    }

    function pushTimestamp(ts) {
        const key = storageKeyBase() + '_times';
        let arr = [];
        try {
            arr = JSON.parse(localStorage.getItem(key) || '[]');
            if (!Array.isArray(arr)) arr = [];
        } catch (e) {
            arr = [];
        }
        arr.push(ts);
        if (arr.length > 20) arr = arr.slice(-20);
        localStorage.setItem(key, JSON.stringify(arr));
    }

    function getLastTimestamp() {
        const key = storageKeyBase() + '_times';
        try {
            const arr = JSON.parse(localStorage.getItem(key) || '[]');
            if (Array.isArray(arr) && arr.length) return arr[arr.length - 1];
        } catch (e) {}
        return null;
    }

    function incrementRunCount() {
        const n = getCount() + 1;
        setCount(n);
        const now = new Date().toISOString();
        pushTimestamp(now);
        return { count: n, last: now };
    }

    function showBadge(count, lastTs) {
        const id = 'gd-vote-badge';
        let el = document.getElementById(id);
        if (!el) {
            el = document.createElement('div');
            el.id = id;
            el.style.position = 'fixed';
            el.style.right = '12px';
            el.style.top = '50%';
            el.style.transform = 'translateY(-50%)';
            el.style.zIndex = 2147483647; // 保证在最上层
            el.style.background = 'rgba(0,0,0,0.75)';
            el.style.color = '#fff';
            el.style.padding = '10px 12px';
            el.style.borderRadius = '10px';
            el.style.fontSize = '12px';
            el.style.fontFamily = 'system-ui,Segoe UI,Roboto,Helvetica,Arial';
            el.style.boxShadow = '0 4px 18px rgba(0,0,0,0.4)';
            el.style.cursor = 'default';
            el.style.userSelect = 'none';
            el.style.maxWidth = '180px';
            el.style.textAlign = 'left';
            el.style.lineHeight = '1.2';
            document.body.appendChild(el);

            el.addEventListener('mouseenter', () => {
                el.style.transform = 'translateY(-50%) scale(1.02)';
            });
            el.addEventListener('mouseleave', () => {
                el.style.transform = 'translateY(-50%) scale(1)';
            });

            el.addEventListener('click', (ev) => {
                if (ev.ctrlKey || ev.metaKey) {
                    if (confirm('重置本表单的运行计数？')) {
                        localStorage.removeItem(storageKeyBase());
                        localStorage.removeItem(storageKeyBase() + '_times');
                        updateBadgeDisplay(0, null);
                    }
                }
            });
        }
        updateBadgeDisplay(count, lastTs);
    }

    function updateBadgeDisplay(count, lastTs) {
        const el = document.getElementById('gd-vote-badge');
        if (!el) return;

        while (el.firstChild) el.removeChild(el.firstChild);

        const last = lastTs ? (new Date(lastTs)).toLocaleString() : '—';

        const title = document.createElement('div');
        title.style.fontWeight = '600';
        title.textContent = `Runs: ${count}`;

        const lastDiv = document.createElement('div');
        lastDiv.style.opacity = '0.9';
        lastDiv.style.fontSize = '11px';
        lastDiv.style.marginTop = '6px';
        lastDiv.textContent = `Last: ${last}`;

        const hint = document.createElement('div');
        hint.style.opacity = '0.7';
        hint.style.fontSize = '10px';
        hint.style.marginTop = '8px';
        hint.textContent = 'Ctrl/Cmd+点击 重置';

        el.appendChild(title);
        el.appendChild(lastDiv);
        el.appendChild(hint);
    }

    onReady(() => {
        showBadge(getCount(), getLastTimestamp());

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

        if (document.querySelectorAll("#lpd4pf")[0]?.textContent.match(/\d+/)[0] == "1") {
            const el = document.querySelectorAll("input.whsOnd.zHQkBf")[0];
            if (el) {
                el.value = randomName();
                el.dispatchEvent(new Event('input', { bubbles: true }));
                el.dispatchEvent(new Event('change', { bubbles: true }));
            }

            randomSelect("10代");
            randomSelect("女性");
        }

        [...document.querySelectorAll('span')].filter(el => el.textContent.includes(json.questions[document.querySelectorAll("#lpd4pf")[0]?.textContent.match(/\d+/)[0]]))[1]?.closest(".nWQGrd.zwllIb label").click();
        setTimeout(() => {
            window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });
            setTimeout(() => {
                [...document.querySelectorAll('span')].filter(el => el.textContent.includes(json.nextPageCode))[0]?.closest("div[role=button]")?.click();

                // [...document.querySelectorAll('span')].filter(el => el.textContent.includes("プライバシーポリシーを確認し、同意しました。"))[0]?.click();
                // [...document.querySelectorAll('span')].filter(el => el.textContent.includes(json.subbmitCode))[0]?.closest("div[role=button]")?.click();

                setTimeout(() => {
                    incrementRunCount();
                    // [...document.querySelectorAll('a')].filter(el => el.textContent.includes("另填写一份回复"))[0]?.click();
                }, 3000)
            }, 1000);
        }, 1000);
    });
})();
