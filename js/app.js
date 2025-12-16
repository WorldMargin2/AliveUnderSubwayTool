// 切换移动菜单显示状态
function toggleMobileMenu() {
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenu) mobileMenu.classList.toggle('show');
}

// 手动横屏切换：尝试使用 Screen Orientation API 锁定到横屏，失败时回退为 CSS 强制横屏
// (已回退) remove manual landscape toggle implementation

// 药品手续费规则
const medicineFees = [
    {price: 0, rate: 4},
    {price: 200000, rate: 6},
    {price: 300000, rate: 8},
    {price: 400000, rate: 12},
    {price: 500000, rate: 15},
    {price: 600000, rate: 23},
    {price: 700000, rate: 30},
    {price: 800000, rate: 40},
    {price: 900000, rate: 50}
];

// 装备手续费规则
const equipmentFees = [
    {"1词条": [0, 5], "2词条": [0, 10], "3词条": [0, 20], "4词条": [0, 40], "rate": 4},
    {"1词条": [5, 7.5], "2词条": [10, 15], "3词条": [20, 40], "4词条": [40, 80], "rate": 6},
    {"1词条": [7.5, 10], "2词条": [15, 20], "3词条": null, "4词条": null, "rate": 8},
    {"1词条": [10, 12.5], "2词条": [20, 25], "3词条": [40, 80], "4词条": [80, 95], "rate": 12},
    {"1词条": [12.5, 15], "2词条": [25, 30], "3词条": null, "4词条": [95, 120], "rate": 15},
    {"1词条": [15, 17.5], "2词条": [30, 35], "3词条": null, "4词条": [120, 140], "rate": 23},
    {"1词条": [17.5, 20], "2词条": [35, 40], "3词条": null, "4词条": [140, 160], "rate": 30},
    {"1词条": [20, 22.5], "2词条": [40, 45], "3词条": [80, 90], "4词条": [160, 180], "rate": 40},
    {"1词条": [22.5, 25], "2词条": [45, 50], "3词条": [90, 100], "4词条": [180, Infinity], "rate": 50},
    {"1词条": [25, Infinity], "2词条": [50, Infinity], "3词条": [100, Infinity], "4词条": null, "rate": 80}
];

let medicineChart = null;
let equipmentChart = null;

// 切换标签页
function switchTab(tabName, evt) {
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });

    if (evt && evt.target) {
        evt.target.classList.add('active');
    }
    const target = document.getElementById(tabName);
    if (target) target.classList.add('active');

    // 更新移动菜单项状态
    const mobileMenuItems = document.querySelectorAll('.mobile-menu-item');
    mobileMenuItems.forEach(item => item.classList.remove('active'));
    mobileMenuItems.forEach(item => {
        const onclick = item.getAttribute('onclick') || '';
        if (onclick.includes(tabName)) item.classList.add('active');
    });

    if (tabName === 'medicine' && !medicineChart) initMedicineChart();
    else if (tabName === 'equipment' && !equipmentChart) initEquipmentChart();
}

// 点击页面其他地方关闭菜单
document.addEventListener('click', function(event) {
    const mobileMenuContainer = document.querySelector('.mobile-menu-container');
    if (!mobileMenuContainer) return;
    if (!mobileMenuContainer.contains(event.target)) {
        const mobileMenu = document.getElementById('mobile-menu');
        if (mobileMenu && mobileMenu.classList.contains('show')) {
            mobileMenu.classList.remove('show');
        }
    }
});

// 解析价格输入
function parsePriceInput(text) {
    if (!text) return 0;

    text = text.trim();

    if (text.includes('千万')) {
        const num = parseFloat(text.replace('千万', ''));
        return isNaN(num) ? 0 : num * 10000000;
    } else if (text.includes('万')) {
        const num = parseFloat(text.replace('万', ''));
        return isNaN(num) ? 0 : num * 10000;
    } else {
        const n = parseFloat(text);
        return isNaN(n) ? 0 : n;
    }
}

// 格式化价格显示
function formatPrice(price) {
    if (!isFinite(price)) return '0';
    if (price >= 100000000) return (price / 100000000).toFixed(2) + '亿';
    if (price >= 10000000) return (price / 10000000).toFixed(2) + '千万';
    if (price >= 10000) return (price / 10000).toFixed(2) + '万';
    return price.toFixed(2);
}

// 计算药品手续费
function calculateMedicineFee(price) {
    let feeRate = 0;
    for (const fee of medicineFees) if (price > fee.price) feeRate = fee.rate;

    const fee = price * feeRate / 100;
    const actualIncome = price - fee;

    return { price, feeRate, fee, actualIncome };
}

// 计算装备手续费
function calculateEquipmentFee(price, entries, basePrice) {
    let feeRate = 0;
    const entriesKey = `${entries}词条`;
    const multiplier = basePrice ? price / basePrice : 0;

    for (const fee of equipmentFees) {
        const rangeValues = fee[entriesKey];
        if (rangeValues && multiplier >= rangeValues[0] && multiplier <= rangeValues[1]) {
            feeRate = fee.rate;
            break;
        }
    }

    const fee = price * feeRate / 100;
    const actualIncome = price - fee;

    return { multiplier, entries, price, feeRate, fee, actualIncome };
}

// 以下函数保持原有逻辑，已移动到外部文件以便后续拆分和清理
// 为简洁起见，这里直接复制原始实现（不改行为）

function generateMedicineChartData() {
    const chartData = [];
    const maxPrice = 1000000; // 100万

    for (let price = 0; price <= maxPrice; price += 10000) {
        const result = calculateMedicineFee(price);
        chartData.push({ x: price, y: result.actualIncome, feeRate: result.feeRate });
    }

    const turningPoints = [];
    for (const fee of medicineFees) {
        if (fee.price <= maxPrice) {
            const result = calculateMedicineFee(fee.price);
            turningPoints.push({ x: fee.price, y: result.actualIncome, feeRate: result.feeRate });
        }
    }
    // helper: 判定给定 x 是否为局部极大值
    function isLocalMax(data, x) {
        if (!data || !data.length) return false;
        let idx = 0; let minDiff = Infinity;
        for (let i = 0; i < data.length; i++) {
            const diff = Math.abs(data[i].x - x);
            if (diff < minDiff) { minDiff = diff; idx = i; }
        }
        if (idx <= 0 || idx >= data.length - 1) return false;
        return data[idx].y >= data[idx - 1].y && data[idx].y >= data[idx + 1].y;
    }

    const extremePoints = [];
    for (const fee of medicineFees) {
        if (fee.price <= maxPrice) {
            const result = calculateMedicineFee(fee.price);
            const localMax = isLocalMax(chartData, fee.price);
            extremePoints.push({ x: fee.price, y: result.actualIncome, feeRate: result.feeRate, isLocalMax: !!localMax });
        }
    }

    let highestPoint = null;
    let maxIncome = -Infinity;
    for (const point of chartData) {
        if (point.y > maxIncome) {
            maxIncome = point.y;
            highestPoint = { x: point.x, y: point.y, feeRate: point.feeRate };
        }
    }

    return { chartData, turningPoints, extremePoints, highestPoint, maxX: maxPrice };
}

function generateEquipmentChartData(entries, basePrice) {
    const chartData = [];
    const maxPrice = 50000000;
    const step = 100000;

    for (let price = 0; price <= maxPrice; price += step) {
        const result = calculateEquipmentFee(price, entries, basePrice);
        chartData.push({ x: result.price, y: result.actualIncome, feeRate: result.feeRate });
    }

    // helper: 判定给定 x 是否为局部极大值（在 chartData 上）
    function isLocalMax(data, x) {
        if (!data || !data.length) return false;
        let idx = 0; let minDiff = Infinity;
        for (let i = 0; i < data.length; i++) {
            const diff = Math.abs(data[i].x - x);
            if (diff < minDiff) { minDiff = diff; idx = i; }
        }
        if (idx <= 0 || idx >= data.length - 1) return false;
        return data[idx].y >= data[idx - 1].y && data[idx].y >= data[idx + 1].y;
    }

    const extremePoints = [];
    const entriesKey = `${entries}词条`;
    const maxMultiplier = basePrice ? maxPrice / basePrice : Infinity;
    let lastFeeRate = null;

    for (const fee of equipmentFees) {
        const rangeValues = fee[entriesKey];
        if (rangeValues && rangeValues[0] < maxMultiplier) {
            if (fee.rate !== lastFeeRate) {
                const leftPoint = Math.max(rangeValues[0], 0);
                const price = basePrice * leftPoint;
                const result = calculateEquipmentFee(price, entries, basePrice);
                const localMax = isLocalMax(chartData, result.price);
                extremePoints.push({ x: result.price, y: result.actualIncome, feeRate: result.feeRate, isLocalMax: !!localMax });
                lastFeeRate = fee.rate;
            }
        }
    }

    let highestPoint = null;
    if (chartData.length > 0) highestPoint = chartData.reduce((max, p) => (p.y > max.y ? p : max), chartData[0]);

    return { chartData, extremePoints, highestPoint, maxX: maxPrice };
}

// 通用图表创建器：传入ctx、datasets、maxX、tooltipId和自定义onHover回调
function createChartWithOptions(ctx, datasets, maxX, tooltipId, onHoverCallback) {
    let chart = null;
    chart = new Chart(ctx, {
        type: 'line',
        data: { datasets },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: { type: 'linear', title: { display: true, text: '期望售价' }, ticks: { callback: v => v >= 0 ? formatPrice(v) : '' }, min: -maxX * 0.05, max: maxX * 1.05 },
                y: { title: { display: true, text: '实际收入' }, maxTicksLimit: 6, ticks: { callback: v => v >= 0 ? formatPrice(v) : '' } }
            },
            plugins: { tooltip: { enabled: false } },
            onHover: (event, activeElements) => { if (onHoverCallback) onHoverCallback(event, chart); },
            onMouseLeave: () => { 
                const t = document.getElementById(tooltipId); if (t) t.style.display = 'none'; 
                try {
                    const absorbDataset = chart.data.datasets.find(d => d.label === '吸附点');
                    if (absorbDataset) { absorbDataset.data = []; chart.update('none'); }
                } catch (e) {}
            }
        }
    });
    return chart;
}

function initMedicineChart() {
    const canvas = document.getElementById('medicine-chart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const data = generateMedicineChartData();
    const medicineSelection = document.getElementById('medicine-selection');

    const medicineDatasets = [
        { label: '实际收入', data: data.chartData, borderColor: 'rgba(54, 162, 235, 1)', backgroundColor: 'rgba(54, 162, 235, 0.2)', fill: true, tension: 0.1, pointRadius: 0, spanGaps: false, xAxisID: 'x' },
        { label: '极值点', data: data.extremePoints, borderColor: 'rgba(255, 99, 132, 1)', backgroundColor: 'rgba(255, 99, 132, 1)', pointRadius: 5, pointHoverRadius: 7, showLine: false },
        { label: '最高点', data: data.highestPoint ? [data.highestPoint] : [], borderColor: 'rgba(255, 159, 64, 1)', backgroundColor: 'rgba(255, 159, 64, 1)', pointRadius: 10, pointHoverRadius: 12, pointStyle: 'circle', showLine: false },
        { label: '吸附点', data: [], borderColor: 'rgba(255, 99, 132, 1)', backgroundColor: 'rgba(255, 99, 132, 0.9)', pointRadius: 8, pointHoverRadius: 10, pointStyle: 'circle', showLine: false }
    ];

    medicineChart = createChartWithOptions(ctx, medicineDatasets, data.maxX, 'medicine-tooltip', (event, chart) => {
        const canvasPosition = Chart.helpers.getRelativePosition(event, chart);
        const tooltip = document.getElementById('medicine-tooltip');
        if (!tooltip) return;
        const extremeDataset = chart.data.datasets.find(d => d.label === '极值点');
        const highestDataset = chart.data.datasets.find(d => d.label === '最高点');
        const absorbDataset = chart.data.datasets.find(d => d.label === '吸附点');
        let snapped = null;
        let snappedType = null;
        const threshold = 10;

        // 优先检测最高点
        if (highestDataset && highestDataset.data && highestDataset.data.length) {
            const hp = highestDataset.data[0];
            const hpPx = chart.scales.x.getPixelForValue(hp.x);
            const distHp = Math.abs(hpPx - canvasPosition.x);
            if (distHp <= threshold) {
                snapped = hp; snappedType = '最高点';
            }
        }

        // 未吸附最高点则检测极值点
        if (!snapped && extremeDataset && extremeDataset.data && extremeDataset.data.length) {
            let nearest = null; let minPxDist = Infinity;
            for (const p of extremeDataset.data) {
                const px = chart.scales.x.getPixelForValue(p.x);
                const dist = Math.abs(px - canvasPosition.x);
                if (dist < minPxDist) { minPxDist = dist; nearest = p; }
            }
            if (minPxDist <= threshold && nearest) { snapped = nearest; snappedType = nearest.isLocalMax ? '极大值' : '极小值'; }
        }

        // 更新吸附数据集并固定显示值
        try {
            absorbDataset && (absorbDataset.data = snapped ? [snapped] : []);
            if (absorbDataset) chart.update('none');
        } catch (e) {}

        // 计算显示值（若吸附则使用吸附点数据，不吸附则使用鼠标对应的 x）
        let displayX, displayResult;
        if (snapped) {
            displayX = snapped.x;
            displayResult = calculateMedicineFee(displayX);
        } else {
            displayX = chart.scales.x.getValueForPixel(canvasPosition.x);
            displayResult = calculateMedicineFee(displayX);
        }

        // 设置 tooltip 位置与内容
        const rect = chart.canvas.getBoundingClientRect();
        const xPixel = snapped ? chart.scales.x.getPixelForValue(snapped.x) : canvasPosition.x;
        tooltip.style.display = 'block';
        tooltip.style.left = (rect.left + xPixel + 10) + 'px';
        tooltip.style.top = (rect.top + canvasPosition.y + 10) + 'px';
        tooltip.innerHTML = `\n<table class="tooltip-table">\n<tr><td>期望售价:</td><td>${formatPrice(displayX)}</td></tr>\n<tr><td>手续费率:</td><td>${displayResult.feeRate.toFixed(2)}%</td></tr>\n<tr><td>手续费:</td><td>${formatPrice(displayResult.fee)}</td></tr>\n<tr><td>实际收入:</td><td>${formatPrice(displayResult.actualIncome)}</td></tr>\n</table>`;

        if (snappedType) tooltip.innerHTML = `<div style="font-weight:bold;margin-bottom:6px;">${snappedType}</div>` + tooltip.innerHTML;

        // 翻转 tooltip：当靠近窗口边缘时尝试向反方向移动，而不是改变宽度
        try {
            const tw = tooltip.offsetWidth || tooltip.getBoundingClientRect().width;
            const th = tooltip.offsetHeight || tooltip.getBoundingClientRect().height;
            let left = rect.left + xPixel + 10;
            let topPos = rect.top + canvasPosition.y + 10;
            if (left + tw > window.innerWidth) left = rect.left + xPixel - tw - 10;
            if (left < 0) left = 10;
            if (topPos + th > window.innerHeight) topPos = rect.top + canvasPosition.y - th - 10;
            if (topPos < 0) topPos = 10;
            tooltip.style.left = left + 'px';
            tooltip.style.top = topPos + 'px';
        } catch (e) {}

        // 在画布上绘制垂直线（以吸附点像素为准，未吸附则用鼠标位置）
        try {
            const ctx2 = chart.ctx;
            ctx2.save();
            ctx2.strokeStyle = 'rgba(0,0,0,0.4)';
            ctx2.lineWidth = 1;
            const top = chart.chartArea.top; const bottom = chart.chartArea.bottom;
            ctx2.beginPath(); ctx2.moveTo(xPixel, top); ctx2.lineTo(xPixel, bottom); ctx2.stroke(); ctx2.restore();
        } catch (e) {}
    });

    if (canvas) {
        let isSelecting = false; let selectionStart = {x:0,y:0}; let selectionEnd = {x:0,y:0};
        canvas.addEventListener('mousedown', function(e){ isSelecting=true; const rect=canvas.getBoundingClientRect(); selectionStart.x=e.clientX-rect.left; selectionStart.y=e.clientY-rect.top; selectionEnd={...selectionStart}; if (medicineSelection) { medicineSelection.style.display='block'; medicineSelection.style.left=selectionStart.x+'px'; medicineSelection.style.top=selectionStart.y+'px'; medicineSelection.style.width='0px'; medicineSelection.style.height='0px'; } });
        canvas.addEventListener('mousemove', function(e){ if(!isSelecting) return; const rect=canvas.getBoundingClientRect(); selectionEnd.x=e.clientX-rect.left; selectionEnd.y=e.clientY-rect.top; const left=Math.min(selectionStart.x, selectionEnd.x); const top=Math.min(selectionStart.y, selectionEnd.y); const width=Math.abs(selectionEnd.x-selectionStart.x); const height=Math.abs(selectionEnd.y-selectionStart.y); if (medicineSelection) { medicineSelection.style.left=left+'px'; medicineSelection.style.top=top+'px'; medicineSelection.style.width=width+'px'; medicineSelection.style.height=height+'px'; } });
        canvas.addEventListener('mouseup', function(e){ if(!isSelecting) return; isSelecting=false; if (medicineSelection) setTimeout(()=>{ medicineSelection.style.display='none'; },500); });
    }
}

function showMedicineCalculationResult(price, income, label) {
    let resultDiv = document.getElementById('medicine-chart-result');
    if (!resultDiv) {
        resultDiv = document.createElement('div');
        resultDiv.id = 'medicine-chart-result';
        resultDiv.dataset.isUserInput = 'false';
        Object.assign(resultDiv.style, { position: 'fixed', backgroundColor: 'rgba(0,0,0,0.7)', color: 'white', padding: '10px', borderRadius: '5px', zIndex: '1000' });
        const container = document.querySelector('#medicine .chart-container');
        if (container) container.appendChild(resultDiv);
    }
    resultDiv.innerHTML = `<div><strong>${label}</strong></div><div>价格: ${formatPrice(price)}</div><div>实际收入: ${formatPrice(income)}</div>`;
    const rect = document.getElementById('medicine-chart')?.getBoundingClientRect();
    if (rect) { resultDiv.style.left = (rect.left + 10) + 'px'; resultDiv.style.top = (rect.top + 10) + 'px'; }
    resultDiv.style.display = 'block';
}

function initEquipmentChart() {
    const canvas = document.getElementById('equipment-chart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const entries = parseInt(document.getElementById('equipment-entries')?.value || '1');
    const basePriceInput = document.getElementById('equipment-base-price')?.value || '270000';
    const basePrice = parsePriceInput(basePriceInput);
    const data = generateEquipmentChartData(entries, basePrice);
    const equipmentSelection = document.getElementById('equipment-selection');

    const equipmentDatasets = [
        { label: '实际收入', data: data.chartData, borderColor: 'rgba(54, 162, 235, 1)', backgroundColor: 'rgba(54, 162, 235, 0.2)', fill: true, tension: 0.1, pointRadius: 0, spanGaps: false, xAxisID: 'x' },
        { label: '极值点', data: data.extremePoints, borderColor: 'rgba(255, 99, 132, 1)', backgroundColor: 'rgba(255, 99, 132, 1)', pointRadius: 5, pointHoverRadius: 7, showLine: false },
        { label: '最高点', data: data.highestPoint ? [data.highestPoint] : [], borderColor: 'rgba(255, 159, 64, 1)', backgroundColor: 'rgba(255, 159, 64, 1)', pointRadius: 10, pointHoverRadius: 12, pointStyle: 'circle', showLine: false },
        { label: '吸附点', data: [], borderColor: 'rgba(255, 99, 132, 1)', backgroundColor: 'rgba(255, 99, 132, 0.9)', pointRadius: 8, pointHoverRadius: 10, pointStyle: 'circle', showLine: false }
    ];

    equipmentChart = createChartWithOptions(ctx, equipmentDatasets, data.maxX, 'equipment-tooltip', (event, chart) => {
        const canvasPosition = Chart.helpers.getRelativePosition(event, chart);
        const tooltip = document.getElementById('equipment-tooltip');
        if (!tooltip) return;
        const extremeDataset = chart.data.datasets.find(d => d.label === '极值点');
        const highestDataset = chart.data.datasets.find(d => d.label === '最高点');
        const absorbDataset = chart.data.datasets.find(d => d.label === '吸附点');
        let snapped = null; let snappedType = null; const threshold = 10;

        if (highestDataset && highestDataset.data && highestDataset.data.length) {
            const hp = highestDataset.data[0];
            const hpPx = chart.scales.x.getPixelForValue(hp.x);
            const distHp = Math.abs(hpPx - canvasPosition.x);
            if (distHp <= threshold) { snapped = hp; snappedType = '最高点'; }
        }

        if (!snapped && extremeDataset && extremeDataset.data && extremeDataset.data.length) {
            let nearest = null; let minPxDist = Infinity;
            for (const p of extremeDataset.data) {
                const px = chart.scales.x.getPixelForValue(p.x);
                const dist = Math.abs(px - canvasPosition.x);
                if (dist < minPxDist) { minPxDist = dist; nearest = p; }
            }
            if (minPxDist <= threshold && nearest) { snapped = nearest; snappedType = nearest.isLocalMax ? '极大值' : '极小值'; }
        }

        try { if (absorbDataset) absorbDataset.data = snapped ? [snapped] : []; if (absorbDataset) chart.update('none'); } catch(e){}

        let displayX, displayResult;
        const entries = parseInt(document.getElementById('equipment-entries')?.value || '1');
        const basePrice = parsePriceInput(document.getElementById('equipment-base-price')?.value || '270000');
        if (snapped) { displayX = snapped.x; displayResult = calculateEquipmentFee(displayX, entries, basePrice); }
        else { displayX = chart.scales.x.getValueForPixel(canvasPosition.x); displayResult = calculateEquipmentFee(displayX, entries, basePrice); }

        const rect = chart.canvas.getBoundingClientRect();
        const xPixel = snapped ? chart.scales.x.getPixelForValue(snapped.x) : canvasPosition.x;
        tooltip.style.display = 'block';
        tooltip.style.left = (rect.left + xPixel + 10) + 'px';
        tooltip.style.top = (rect.top + canvasPosition.y + 10) + 'px';
        tooltip.innerHTML = `\n<table class="tooltip-table">\n<tr><td>期望售价:</td><td>${formatPrice(displayX)}</td></tr>\n<tr><td>手续费率:</td><td>${displayResult.feeRate.toFixed(2)}%</td></tr>\n<tr><td>手续费:</td><td>${formatPrice(displayResult.fee)}</td></tr>\n<tr><td>实际收入:</td><td>${formatPrice(displayResult.actualIncome)}</td></tr>\n</table>`;
        if (snappedType) tooltip.innerHTML = `<div style="font-weight:bold;margin-bottom:6px;">${snappedType}</div>` + tooltip.innerHTML;

        // 翻转 tooltip：当靠近窗口边缘时尝试向反方向移动，而不是改变宽度
        try {
            const tw = tooltip.offsetWidth || tooltip.getBoundingClientRect().width;
            const th = tooltip.offsetHeight || tooltip.getBoundingClientRect().height;
            let left = rect.left + xPixel + 10;
            let topPos = rect.top + canvasPosition.y + 10;
            if (left + tw > window.innerWidth) left = rect.left + xPixel - tw - 10;
            if (left < 0) left = 10;
            if (topPos + th > window.innerHeight) topPos = rect.top + canvasPosition.y - th - 10;
            if (topPos < 0) topPos = 10;
            tooltip.style.left = left + 'px';
            tooltip.style.top = topPos + 'px';
        } catch (e) {}

        try { const ctx2 = chart.ctx; ctx2.save(); ctx2.strokeStyle = 'rgba(0,0,0,0.4)'; ctx2.lineWidth = 1; const top = chart.chartArea.top; const bottom = chart.chartArea.bottom; ctx2.beginPath(); ctx2.moveTo(xPixel, top); ctx2.lineTo(xPixel, bottom); ctx2.stroke(); ctx2.restore(); } catch(e){}
    });

    if (canvas) {
        let isSelecting = false; let selectionStart = {x:0,y:0}; let selectionEnd = {x:0,y:0};
        canvas.addEventListener('mousedown', function(e){ isSelecting=true; const rect=canvas.getBoundingClientRect(); selectionStart.x=e.clientX-rect.left; selectionStart.y=e.clientY-rect.top; selectionEnd={...selectionStart}; if (equipmentSelection) { equipmentSelection.style.display='block'; equipmentSelection.style.left=selectionStart.x+'px'; equipmentSelection.style.top=selectionStart.y+'px'; equipmentSelection.style.width='0px'; equipmentSelection.style.height='0px'; } });
        canvas.addEventListener('mousemove', function(e){ if(!isSelecting) return; const rect=canvas.getBoundingClientRect(); selectionEnd.x=e.clientX-rect.left; selectionEnd.y=e.clientY-rect.top; const left=Math.min(selectionStart.x, selectionEnd.x); const top=Math.min(selectionStart.y, selectionEnd.y); const width=Math.abs(selectionEnd.x-selectionStart.x); const height=Math.abs(selectionEnd.y-selectionStart.y); if (equipmentSelection) { equipmentSelection.style.left=left+'px'; equipmentSelection.style.top=top+'px'; equipmentSelection.style.width=width+'px'; equipmentSelection.style.height=height+'px'; } });
        canvas.addEventListener('mouseup', function(e){ if(!isSelecting) return; isSelecting=false; if (equipmentSelection) setTimeout(()=>{ equipmentSelection.style.display='none'; },500); });
    }
}

function showCalculationResult(price, income, label) {
    let resultDiv = document.getElementById('chart-result');
    if (!resultDiv) {
        resultDiv = document.createElement('div');
        resultDiv.id = 'chart-result';
        resultDiv.dataset.isUserInput = 'false';
        Object.assign(resultDiv.style, { position: 'fixed', backgroundColor: 'rgba(0,0,0,0.7)', color: 'white', padding: '10px', borderRadius: '5px', zIndex: '1000' });
        const container = document.querySelector('#equipment .chart-container');
        if (container) container.appendChild(resultDiv);
    }
    resultDiv.innerHTML = `<div><strong>${label}</strong></div><div>价格: ${formatPrice(price)}</div><div>实际收入: ${formatPrice(income)}</div>`;
    const rect = document.getElementById('equipment-chart')?.getBoundingClientRect();
    if (rect) { resultDiv.style.left = (rect.left + 10) + 'px'; resultDiv.style.top = (rect.top + 10) + 'px'; }
    resultDiv.style.display = 'block';
}

function updateDataTable(data) {
    const tbody = document.getElementById('equipment-data-points');
    if (!tbody) return;
    tbody.innerHTML = '';
    const extremePoints = data.extremePoints || [];
    extremePoints.forEach((point, index) => {
        const row = tbody.insertRow();
        const typeLabel = point.isLocalMax ? '极大值' : '极小值';
        row.innerHTML = `<td>极值点 ${index + 1} (${typeLabel})</td><td>${formatPrice(point.x)}</td><td>${formatPrice(point.y)}</td><td>${point.feeRate}%</td>`;
    });
    if (data.highestPoint) {
        const row = tbody.insertRow();
        row.innerHTML = `<td>最高点</td><td>${formatPrice(data.highestPoint.x)}</td><td>${formatPrice(data.highestPoint.y)}</td><td>${data.highestPoint.feeRate}%</td>`;
        row.style.backgroundColor = 'rgba(75, 192, 192, 0.2)';
    }
}

// 事件绑定
document.getElementById('equipment-entries')?.addEventListener('change', function() {
    if (equipmentChart) {
        const entries = parseInt(this.value);
        const basePrice = parsePriceInput(document.getElementById('equipment-base-price')?.value || '270000');
        const data = generateEquipmentChartData(entries, basePrice);
        equipmentChart.data.datasets[0].data = data.chartData || [];
        equipmentChart.data.datasets[1].data = data.extremePoints || [];
        equipmentChart.data.datasets[2].data = data.highestPoint ? [data.highestPoint] : [];
        equipmentChart.options.scales.x.max = data.maxX;
        const maxYValue = Math.max(...data.chartData.map(d => d.y));
        equipmentChart.options.scales.y.max = maxYValue * 1.2;
        const currentPointIndex = equipmentChart.data.datasets.findIndex(dataset => dataset.label === '当前输入');
        if (currentPointIndex !== -1) equipmentChart.data.datasets.splice(currentPointIndex,1);
        equipmentChart.update();
        updateDataTable(data);
    }
});

document.getElementById('equipment-base-price')?.addEventListener('change', function() {
    if (equipmentChart) {
        const entries = parseInt(document.getElementById('equipment-entries')?.value || '1');
        const basePrice = parsePriceInput(this.value);
        const data = generateEquipmentChartData(entries, basePrice);
        equipmentChart.data.datasets[0].data = data.chartData || [];
        equipmentChart.data.datasets[1].data = data.extremePoints || [];
        equipmentChart.data.datasets[2].data = data.highestPoint ? [data.highestPoint] : [];
        equipmentChart.options.scales.x.max = data.maxX;
        const maxYValue = Math.max(...data.chartData.map(d => d.y));
        equipmentChart.options.scales.y.max = maxYValue * 1.2;
        const currentPointIndex = equipmentChart.data.datasets.findIndex(dataset => dataset.label === '当前输入');
        if (currentPointIndex !== -1) equipmentChart.data.datasets.splice(currentPointIndex,1);
        equipmentChart.update();
        updateDataTable(data);
    }
});

// 初始化
initMedicineChart();
initEquipmentChart();

document.getElementById('medicine-price')?.addEventListener('input', function() { if (this.value.trim()) calculateMedicine(); });
document.getElementById('equipment-price')?.addEventListener('input', function() { if (this.value.trim()) calculateEquipment(); });

function calculateMedicine() {
    const price = parsePriceInput(document.getElementById('medicine-price')?.value || '0');
    const result = calculateMedicineFee(price);
    if (medicineChart) {
        let currentPointDataset = medicineChart.data.datasets.find(dataset => dataset.label === '当前输入');
        if (!currentPointDataset) {
            medicineChart.data.datasets.push({ label: '当前输入', data: [{x: result.price, y: result.actualIncome}], borderColor: 'rgba(75,192,192,1)', backgroundColor: 'rgba(75,192,192,1)', pointRadius:7, pointHoverRadius:9, showLine:false });
        } else currentPointDataset.data = [{x: result.price, y: result.actualIncome}];
        medicineChart.update('none');
    }
    if (result && result.price && result.actualIncome) { showMedicineCalculationResult(result.price, result.actualIncome, '当前输入价格'); const rd = document.getElementById('medicine-chart-result'); if (rd) rd.dataset.isUserInput = 'true'; }
}

function calculateEquipment() {
    const price = parsePriceInput(document.getElementById('equipment-price')?.value || '0');
    const basePrice = parsePriceInput(document.getElementById('equipment-base-price')?.value || '270000');
    const entries = parseInt(document.getElementById('equipment-entries')?.value || '1');
    const result = calculateEquipmentFee(price, entries, basePrice);
    if (equipmentChart) {
        let currentPointDataset = equipmentChart.data.datasets.find(dataset => dataset.label === '当前输入');
        if (!currentPointDataset) {
            equipmentChart.data.datasets.push({ label: '当前输入', data: [{x: result.price, y: result.actualIncome}], borderColor: 'rgba(75,192,192,1)', backgroundColor: 'rgba(75,192,192,1)', pointRadius:7, pointHoverRadius:9, showLine:false });
        } else currentPointDataset.data = [{x: result.price, y: result.actualIncome}];
        equipmentChart.update('none');
    }
    if (result && result.price && result.actualIncome) { showCalculationResult(result.price, result.actualIncome, '当前输入价格'); const rd = document.getElementById('chart-result'); if (rd) rd.dataset.isUserInput = 'true'; }
}
