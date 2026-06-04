/* ---------------------------------------------------
    港股 / 美股手续费计算器
    佣金全免，仅计算「平台费」与「代收费」
----------------------------------------------------- */

// 默认费率（可在「费率设置」中调整，会保存到本地）
const DEFAULTS = {
    hk: {
        symbol: "HK$",
        platformFee: 15,          // 平台费 HK$/笔
        stampDutyRate: 0.001,     // 印花税 0.10%
        tradingFeeRate: 0.0000565,// 交易费(交易所) 0.00565%
        sfcLevyRate: 0.000027,    // 证监会交易征费 0.0027%
        afrcLevyRate: 0.0000015,  // 会财局交易征费 0.00015%
        ccassRate: 0.000042       // 交收费(CCASS) 0.0042%（2025-06-30 起，取消最低/最高收费限额）
    },
    us: {
        symbol: "US$",
        platformPerShare: 0.005,  // 平台使用费 US$/股
        platformMin: 1,           // 平台费最低 US$/笔
        settlePerShare: 0.003,    // 交收费 US$/股 (买卖均收)
        catPerShare: 0.000003,    // 综合审计跟踪监管费 US$/股 (NMS, 买卖均收)
        secRate: 0.0000278,       // 证监会规费(仅卖出)
        secMin: 0.01,             // 证监会规费每笔最低 US$
        tafPerShare: 0.000166,    // 交易活动费(仅卖出) US$/股
        tafMin: 0.01,             // 交易活动费每笔最低 US$
        tafMax: 8.30              // 交易活动费上限 US$
    }
};

// 费率字段展示元信息
const FIELD_META = {
    hk: [
        { key: "platformFee", label: "平台费 (HK$/笔)", step: 0.01 },
        { key: "stampDutyRate", label: "印花税费率 (%)", percent: true },
        { key: "tradingFeeRate", label: "交易费费率 (%)", percent: true },
        { key: "sfcLevyRate", label: "证监会交易征费费率 (%)", percent: true },
        { key: "afrcLevyRate", label: "会财局交易征费费率 (%)", percent: true },
        { key: "ccassRate", label: "交收费费率 (%)", percent: true }
    ],
    us: [
        { key: "platformPerShare", label: "平台使用费 (US$/股)", step: 0.0001 },
        { key: "platformMin", label: "平台费最低 (US$/笔)", step: 0.01 },
        { key: "settlePerShare", label: "交收费 (US$/股)", step: 0.0001 },
        { key: "catPerShare", label: "综合审计跟踪费 (US$/股)", step: 0.000001 },
        { key: "secRate", label: "证监会规费费率 (%)", percent: true },
        { key: "secMin", label: "证监会规费最低 (US$)", step: 0.01 },
        { key: "tafPerShare", label: "交易活动费 (US$/股)", step: 0.0001 },
        { key: "tafMin", label: "交易活动费最低 (US$)", step: 0.01 },
        { key: "tafMax", label: "交易活动费上限 (US$)", step: 0.01 }
    ]
};

const STORAGE_KEY = "dpull_fee_calc_rates_v2";

let state = {
    market: "hk",
    rates: loadRates()
};

function loadRates() {
    let saved = {};
    try {
        saved = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    } catch (e) {
        saved = {};
    }
    return {
        hk: Object.assign({}, DEFAULTS.hk, saved.hk),
        us: Object.assign({}, DEFAULTS.us, saved.us)
    };
}

function saveRates() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state.rates));
    } catch (e) { /* ignore */ }
}

function getSide() {
    return document.querySelector('input[name="side"]:checked').value;
}

function num(id) {
    const v = parseFloat(document.getElementById(id).value);
    return isNaN(v) || v < 0 ? 0 : v;
}

function money(n) {
    return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// 计算港股费用
function calcHK(turnover, qty, side, r) {
    const platform = [
        { name: "平台费", amount: turnover > 0 ? r.platformFee : 0 }
    ];
    const collect = [];
    if (turnover > 0) {
        // 印花税：不足 HK$1 按 HK$1 计（向上取整）
        collect.push({ name: "印花税", amount: Math.ceil(turnover * r.stampDutyRate) });
        // 交易费：最低 HK$0.01
        collect.push({ name: "交易费", amount: Math.max(turnover * r.tradingFeeRate, 0.01) });
        collect.push({ name: "证监会交易征费", amount: turnover * r.sfcLevyRate });
        collect.push({ name: "会财局交易征费", amount: turnover * r.afrcLevyRate });
        // 交收费(CCASS)：2025-06-30 起按成交额 0.0042% 计，已取消最低/最高收费限额
        collect.push({ name: "交收费 (CCASS)", amount: turnover * r.ccassRate });
    }
    return { platform, collect };
}

// 计算美股费用
function calcUS(turnover, qty, side, r) {
    let platformFee = 0;
    if (qty > 0) {
        platformFee = r.platformPerShare * qty;
        platformFee = Math.max(platformFee, r.platformMin);
    }
    const platform = [
        { name: "平台使用费", amount: platformFee }
    ];
    const collect = [];
    if (qty > 0) {
        // 交收费、综合审计跟踪监管费：买卖均收取
        collect.push({ name: "交收费", amount: r.settlePerShare * qty });
        collect.push({ name: "综合审计跟踪监管费", amount: r.catPerShare * qty });
    }
    if (side === "sell" && turnover > 0) {
        collect.push({ name: "证监会规费 (SEC)", amount: Math.max(turnover * r.secRate, r.secMin) });
        collect.push({ name: "交易活动费 (TAF)", amount: Math.min(Math.max(r.tafPerShare * qty, r.tafMin), r.tafMax) });
    }
    return { platform, collect };
}

function calculate() {
    const r = state.rates[state.market];
    const price = num("price");
    const qty = num("qty");
    const side = getSide();
    const turnover = price * qty;

    const result = state.market === "hk"
        ? calcHK(turnover, qty, side, r)
        : calcUS(turnover, qty, side, r);

    // 渲染明细
    const body = document.getElementById("resultBody");
    const rows = [];
    rows.push(`<tr class="fee-row"><td colspan="2" class="text-muted small">佣金</td><td class="text-end text-success">免费</td></tr>`);

    function section(title, items) {
        if (!items.length) return;
        rows.push(`<tr class="fee-row table-light"><td colspan="3" class="fw-semibold small">${title}</td></tr>`);
        items.forEach(it => {
            rows.push(`<tr class="fee-row"><td></td><td>${it.name}</td><td class="text-end">${r.symbol} ${money(it.amount)}</td></tr>`);
        });
    }
    section("平台费", result.platform);
    section("代收费", result.collect);
    body.innerHTML = rows.join("");

    const platformTotal = result.platform.reduce((s, i) => s + i.amount, 0);
    const collectTotal = result.collect.reduce((s, i) => s + i.amount, 0);
    const totalFee = platformTotal + collectTotal;

    document.getElementById("totalFee").textContent = money(totalFee);
    document.getElementById("turnover").textContent = money(turnover);

    // 买入总成本 = 成交额 + 费用；卖出实收 = 成交额 - 费用
    if (side === "buy") {
        document.getElementById("netLabel").textContent = "买入总成本";
        document.getElementById("netAmount").textContent = money(turnover + totalFee);
    } else {
        document.getElementById("netLabel").textContent = "卖出实收金额";
        document.getElementById("netAmount").textContent = money(Math.max(turnover - totalFee, 0));
    }
}

function renderRatePanel() {
    const panel = document.getElementById("ratePanel");
    const meta = FIELD_META[state.market];
    const r = state.rates[state.market];
    const html = ['<div class="row g-2">'];
    meta.forEach(f => {
        const val = f.percent ? (r[f.key] * 100) : r[f.key];
        const step = f.percent ? "0.0001" : (f.step || 0.01);
        html.push(`
            <div class="col-12 col-sm-6 d-flex justify-content-between align-items-center">
                <label class="form-label mb-0 me-2 small" for="rate_${f.key}">${f.label}</label>
                <input type="number" class="form-control form-control-sm rate-input" id="rate_${f.key}"
                    data-key="${f.key}" data-percent="${!!f.percent}" step="${step}" min="0" value="${val}">
            </div>`);
    });
    html.push("</div>");
    panel.innerHTML = html.join("");

    panel.querySelectorAll("input[data-key]").forEach(inp => {
        inp.addEventListener("input", function () {
            let v = parseFloat(this.value);
            if (isNaN(v) || v < 0) v = 0;
            const key = this.dataset.key;
            state.rates[state.market][key] = this.dataset.percent === "true" ? v / 100 : v;
            saveRates();
            calculate();
        });
    });
}

function updateCurrencySymbols() {
    const sym = state.rates[state.market].symbol;
    document.querySelectorAll(".cur-symbol").forEach(el => { el.textContent = sym; });
}

function setupEvents() {
    document.querySelectorAll(".market-btn").forEach(btn => {
        btn.addEventListener("click", function () {
            document.querySelectorAll(".market-btn").forEach(b => b.classList.remove("active"));
            this.classList.add("active");
            state.market = this.dataset.market;
            updateCurrencySymbols();
            renderRatePanel();
            calculate();
        });
    });

    document.querySelectorAll('input[name="side"]').forEach(el => {
        el.addEventListener("change", calculate);
    });

    ["price", "qty"].forEach(id => {
        document.getElementById(id).addEventListener("input", calculate);
    });

    document.getElementById("resetRates").addEventListener("click", function () {
        state.rates[state.market] = Object.assign({}, DEFAULTS[state.market]);
        saveRates();
        renderRatePanel();
        calculate();
    });
}

setupEvents();
updateCurrencySymbols();
renderRatePanel();
calculate();
