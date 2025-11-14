// 全局变量
let currentUsdToCnyRate = 0; // USD → CNY 汇率
let currentCnyToUsdRate = 0; // CNY → USD 汇率
let isUpdatingRate = false;
let isUsdToCny = true; // true: USD → CNY, false: CNY → USD
let isDarkMode = true; // 主题状态

// DOM元素
const fromAmountInput = document.getElementById('fromAmount');
const toAmountInput = document.getElementById('toAmount');
const fromLabel = document.getElementById('fromLabel');
const toLabel = document.getElementById('toLabel');
const fromSymbol = document.getElementById('fromSymbol');
const toSymbol = document.getElementById('toSymbol');
const currentRateElement = document.getElementById('currentRate');
const rateLabelElement = document.getElementById('rateLabel');
const lastUpdatedElement = document.getElementById('lastUpdated');
const refreshButton = document.getElementById('refreshRate');
const switchDirectionButton = document.getElementById('switchDirection');
const themeToggleBtn = document.getElementById('themeToggle');
const conversionArrow = document.getElementById('conversionArrow');
const arrowIcon = document.getElementById('arrowIcon');
const quickButtons = document.querySelectorAll('.quick-btn');
const customInput = document.getElementById('customInput');
const customOutput = document.getElementById('customOutput');
const toggleCustomSectionBtn = document.getElementById('toggleCustomSection');
const customSection = document.getElementById('customSection');
const storageInput = document.getElementById('storageInput');
const storageOutput = document.getElementById('storageOutput');

// API配置
const USD_API_URL = 'https://api.exchangerate-api.com/v4/latest/USD';
const CNY_API_URL = 'https://api.exchangerate-api.com/v4/latest/CNY';
const BACKUP_USD_API = 'https://api.fxratesapi.com/latest?base=USD&symbols=CNY';
const BACKUP_CNY_API = 'https://api.fxratesapi.com/latest?base=CNY&symbols=USD';

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    initializeTheme();
    initializeConverter();
    setupEventListeners();
});

// 初始化转换器
async function initializeConverter() {
    await fetchExchangeRate();
    updateUI();
}

// 设置事件监听器
function setupEventListeners() {
    // 主题切换按钮
    themeToggleBtn.addEventListener('click', toggleTheme);

    // 输入框事件
    fromAmountInput.addEventListener('input', handleFromAmountInput);
    fromAmountInput.addEventListener('focus', function() {
        this.select();
    });

    // 切换方向按钮
    switchDirectionButton.addEventListener('click', switchConversionDirection);

    // 转换箭头点击
    if (conversionArrow) {
        conversionArrow.addEventListener('click', switchConversionDirection);
    }

    // 刷新按钮事件
    refreshButton.addEventListener('click', handleRefreshRate);
    
    // 快速金额按钮事件
    quickButtons.forEach(button => {
        button.addEventListener('click', function() {
            const amount = parseFloat(this.dataset.amount.replace(',', ''));
            fromAmountInput.value = amount;
            performConversion(amount);
            
            // 添加视觉反馈
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
        });
    });
    
    // 键盘快捷键
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && document.activeElement === fromAmountInput) {
            e.preventDefault();
            fromAmountInput.blur();
        }
        if (e.key === 'F5' || (e.ctrlKey && e.key === 'r')) {
            e.preventDefault();
            handleRefreshRate();
        }
        if (e.key === 'Tab' && e.shiftKey) {
            e.preventDefault();
            switchConversionDirection();
        }
    });

    customInput.addEventListener('input', handleCustomInput);
    toggleCustomSectionBtn.addEventListener('click', toggleCustomSection);
    storageInput.addEventListener('input', handleStorageInput);
}

// 处理输入金额变化
function handleFromAmountInput(event) {
    const amount = parseFloat(event.target.value);
    if (isNaN(amount) || amount < 0) {
        toAmountInput.value = '';
        return;
    }
    performConversion(amount);
}

// 执行转换计算
function performConversion(amount) {
    let rate, result;
    
    if (isUsdToCny) {
        // USD → CNY
        rate = currentUsdToCnyRate;
        if (rate === 0) {
            showError('汇率数据未加载，请稍后再试');
            return;
        }
        result = formatNumber((amount * rate).toFixed(4));
    } else {
        // CNY → USD
        rate = currentCnyToUsdRate;
        if (rate === 0) {
            showError('汇率数据未加载，请稍后再试');
            return;
        }
        result = formatNumber((amount * rate).toFixed(4));
    }
    
    toAmountInput.value = result;
    
    // 添加动画效果
    toAmountInput.style.transform = 'scale(1.02)';
    setTimeout(() => {
        toAmountInput.style.transform = '';
    }, 200);
}

// 切换转换方向
function switchConversionDirection() {
    isUsdToCny = !isUsdToCny;
    
    // 清空输入框
    fromAmountInput.value = '';
    toAmountInput.value = '';
    
    // 更新UI
    updateUI();
    
    // 添加切换动画
    if (conversionArrow) {
        const arrow = conversionArrow.querySelector('svg');
        if (arrow) {
            arrow.style.transform = 'rotate(180deg)';
            setTimeout(() => {
                arrow.style.transform = '';
            }, 300);
        }
    }
    
    // 按钮动画
    switchDirectionButton.style.transform = 'scale(0.95)';
    setTimeout(() => {
        switchDirectionButton.style.transform = '';
    }, 150);
    
    showNotification(isUsdToCny ? '已切换至: 美元 → 人民币' : '已切换至: 人民币 → 美元', 'info');
}

// 更新UI界面
function updateUI() {
    if (isUsdToCny) {
        // USD → CNY 模式
        fromLabel.textContent = '美元金额 (USD)';
        toLabel.textContent = '人民币金额 (CNY)';
        fromSymbol.textContent = '$';
        toSymbol.textContent = '¥';
        fromAmountInput.placeholder = '输入美元金额';
        toAmountInput.placeholder = '人民币金额';
        rateLabelElement.textContent = '当前汇率 (USD → CNY):';
        
        // 更新箭头方向
        if (arrowIcon) {
            arrowIcon.innerHTML = '<path d="M7 13L12 18L17 13M7 6L12 11L17 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>';
        }
        
        // 更新汇率显示
        if (currentUsdToCnyRate > 0) {
            currentRateElement.textContent = `1 USD = ${currentUsdToCnyRate.toFixed(2)} CNY`;
        }
    } else {
        // CNY → USD 模式
        fromLabel.textContent = '人民币金额 (CNY)';
        toLabel.textContent = '美元金额 (USD)';
        fromSymbol.textContent = '¥';
        toSymbol.textContent = '$';
        fromAmountInput.placeholder = '输入人民币金额';
        toAmountInput.placeholder = '美元金额';
        rateLabelElement.textContent = '当前汇率 (CNY → USD):';
        
        // 更新箭头方向
        if (arrowIcon) {
            arrowIcon.innerHTML = '<path d="M17 11L12 6L7 11M17 18L12 13L7 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>';
        }
        
        // 更新汇率显示
        if (currentCnyToUsdRate > 0) {
            currentRateElement.textContent = `1 CNY = ${currentCnyToUsdRate.toFixed(2)} USD`;
        }
    }
    
    // 重新计算如果有输入值
    const currentAmount = parseFloat(fromAmountInput.value);
    if (!isNaN(currentAmount) && currentAmount > 0) {
        performConversion(currentAmount);
    }
}

// 获取汇率数据
async function fetchExchangeRate() {
    if (isUpdatingRate) return;
    
    isUpdatingRate = true;
    showLoadingState();
    
    try {
        // 同时获取两个方向的汇率
        const [usdToCny, cnyToUsd] = await Promise.all([
            fetchUsdToCnyRate(),
            fetchCnyToUsdRate()
        ]);
        
        if (usdToCny && cnyToUsd) {
            updateExchangeRates(usdToCny, cnyToUsd);
        } else {
            // 使用模拟数据
            const simulatedUsdToCny = getSimulatedRate('USD_TO_CNY');
            const simulatedCnyToUsd = getSimulatedRate('CNY_TO_USD');
            updateExchangeRates(simulatedUsdToCny, simulatedCnyToUsd);
            showWarning('无法获取实时汇率，使用模拟数据');
        }
        
    } catch (error) {
        console.error('获取汇率失败:', error);
        const simulatedUsdToCny = getSimulatedRate('USD_TO_CNY');
        const simulatedCnyToUsd = getSimulatedRate('CNY_TO_USD');
        updateExchangeRates(simulatedUsdToCny, simulatedCnyToUsd);
        showError('汇率获取失败，使用模拟数据');
    } finally {
        isUpdatingRate = false;
        hideLoadingState();
    }
}

// 获取USD → CNY汇率
async function fetchUsdToCnyRate() {
    try {
        let rate = await tryFetchFromAPI(USD_API_URL, 'CNY');
        if (!rate) {
            rate = await tryFetchFromBackupAPI(BACKUP_USD_API, 'CNY');
        }
        return rate;
    } catch (error) {
        console.error('获取USD→CNY汇率失败:', error);
        return null;
    }
}

// 获取CNY → USD汇率
async function fetchCnyToUsdRate() {
    try {
        let rate = await tryFetchFromAPI(CNY_API_URL, 'USD');
        if (!rate) {
            rate = await tryFetchFromBackupAPI(BACKUP_CNY_API, 'USD');
        }
        return rate;
    } catch (error) {
        console.error('获取CNY→USD汇率失败:', error);
        return null;
    }
}

// 尝试从主API获取汇率
async function tryFetchFromAPI(url, targetCurrency) {
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return data.rates && data.rates[targetCurrency] ? data.rates[targetCurrency] : null;
    } catch (error) {
        console.error('主API请求失败:', error);
        return null;
    }
}

// 尝试从备用API获取汇率
async function tryFetchFromBackupAPI(url, targetCurrency) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('备用API请求失败');
        
        const data = await response.json();
        return data.rates && data.rates[targetCurrency] ? data.rates[targetCurrency] : null;
    } catch (error) {
        console.error('备用API请求失败:', error);
        return null;
    }
}

// 获取模拟汇率
function getSimulatedRate(type) {
    const now = Date.now();
    const variation = Math.sin(now / 1000000) * 0.05; // 5%波动
    
    if (type === 'USD_TO_CNY') {
        const baseRate = 7.2; // 大约1 USD = 7.2 CNY
        return Math.round((baseRate + variation) * 100000000000000) / 100000000000000;
    } else {
        const baseRate = 0.14; // 大约1 CNY = 0.14 USD
        return Math.round((baseRate + variation * 0.01) * 100000000000000) / 100000000000000;
    }
}

// 更新汇率显示
function updateExchangeRates(usdToCny, cnyToUsd) {
    currentUsdToCnyRate = usdToCny;
    currentCnyToUsdRate = cnyToUsd;
    
    // 根据当前转换方向显示对应汇率
    if (isUsdToCny) {
        currentRateElement.textContent = `1 USD = ${usdToCny.toFixed(2)} CNY`;
    } else {
        currentRateElement.textContent = `1 CNY = ${cnyToUsd.toFixed(2)} USD`;
    }
    
    const now = new Date();
    const timeString = now.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    lastUpdatedElement.textContent = `最后更新: ${timeString}`;
    
    // 如果输入框有值，重新计算
    const amount = parseFloat(fromAmountInput.value);
    if (!isNaN(amount) && amount > 0) {
        performConversion(amount);
    }
    
    // 添加成功动画
    currentRateElement.style.color = '#10b981';
    setTimeout(() => {
        currentRateElement.style.color = '';
    }, 1000);
}

// 处理刷新汇率按钮
async function handleRefreshRate() {
    if (isUpdatingRate) return;
    
    // 按钮动画
    refreshButton.style.transform = 'rotate(360deg)';
    setTimeout(() => {
        refreshButton.style.transform = '';
    }, 600);
    
    await fetchExchangeRate();
    showNotification('汇率已刷新', 'info');
}

// 显示加载状态
function showLoadingState() {
    currentRateElement.textContent = '更新中...';
    currentRateElement.classList.add('loading');
    lastUpdatedElement.textContent = '正在获取最新汇率...';
    refreshButton.disabled = true;
}

// 隐藏加载状态
function hideLoadingState() {
    currentRateElement.classList.remove('loading');
    refreshButton.disabled = false;
}

// 显示错误信息
function showError(message) {
    showNotification(message, 'error');
}

// 显示警告信息
function showWarning(message) {
    showNotification(message, 'warning');
}

// 显示通知
function showNotification(message, type = 'info') {
    // 移除现有的通知
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // 创建新通知
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">×</button>
    `;
    
    // 添加样式
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'error' ? 'rgba(127, 29, 29, 0.92)' : type === 'warning' ? 'rgba(133, 77, 14, 0.9)' : 'rgba(30, 41, 59, 0.92)'};
        color: ${type === 'error' ? '#fecaca' : type === 'warning' ? '#fde68a' : '#bfdbfe'};
        padding: 14px 20px;
        border-radius: 14px;
        border: 1px solid ${type === 'error' ? 'rgba(239, 68, 68, 0.45)' : type === 'warning' ? 'rgba(253, 224, 71, 0.35)' : 'rgba(96, 165, 250, 0.35)'};
        box-shadow: 0 20px 30px rgba(0, 0, 0, 0.45);
        backdrop-filter: blur(8px);
        z-index: 1000;
        display: flex;
        align-items: center;
        gap: 12px;
        max-width: 320px;
        animation: slideIn 0.3s ease-out;
    `;
    
    // 添加按钮样式
    const button = notification.querySelector('button');
    button.style.cssText = `
        background: none;
        border: none;
        font-size: 18px;
        cursor: pointer;
        color: inherit;
        padding: 0;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: background 0.2s ease;
    `;

    button.addEventListener('mouseover', () => {
        button.style.background = 'rgba(255, 255, 255, 0.12)';
    });

    button.addEventListener('mouseout', () => {
        button.style.background = 'none';
    });
    
    document.body.appendChild(notification);
    
    // 自动移除
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

// 添加CSS动画
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;

// 初始化主题
function initializeTheme() {
    // 从localStorage读取保存的主题设置
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        isDarkMode = false;
        document.body.classList.add('light-mode');
    } else {
        isDarkMode = true;
        document.body.classList.remove('light-mode');
    }
}

// 切换主题
function toggleTheme() {
    isDarkMode = !isDarkMode;

    if (isDarkMode) {
        document.body.classList.remove('light-mode');
        localStorage.setItem('theme', 'dark');
        showNotification('已切换至夜间模式', 'info');
    } else {
        document.body.classList.add('light-mode');
        localStorage.setItem('theme', 'light');
        showNotification('已切换至白天模式', 'info');
    }

    // 添加按钮动画
    themeToggleBtn.style.transform = 'scale(0.9) rotate(180deg)';
    setTimeout(() => {
        themeToggleBtn.style.transform = 'scale(1) rotate(360deg)';
        setTimeout(() => {
            themeToggleBtn.style.transform = '';
        }, 150);
    }, 150);
}

// 格式化数字，去除末尾的0
function formatNumber(num) {
    // 转换为字符串并去除小数点后末尾的0
    return parseFloat(num).toString().replace(/(\.[0-9]*[1-9])0+$|\.(0+)$/, '$1');
}

function handleCustomInput(event) {
    const value = parseFloat(event.target.value);
    if (isNaN(value)) {
        customOutput.value = '';
        return;
    }
    const result = value / 1000000;
    // Use toFixed with sufficient precision to avoid scientific notation,
    // then use a regex to remove trailing zeros.
    customOutput.value = result.toFixed(20).replace(/(\.[0-9]*[1-9])0+$|\.(0+)$/, '$1');
}

function toggleCustomSection() {
    toggleCustomSectionBtn.classList.toggle('active');
    customSection.classList.toggle('open');
}

function convertToComputerStorage(sizeStr) {
    // Convert to uppercase for consistent processing
    sizeStr = sizeStr.toUpperCase().trim();

    // Regular expression to extract the number and unit (K, M, G, T)
    const regex = /^([0-9.]+)\s*([KMGTP])$/;
    const match = sizeStr.match(regex);

    if (match) {
        const number = parseFloat(match[1]);
        const unit = match[2];

        if (isNaN(number)) return null;

        switch (unit) {
            case 'K':
                // Handle K unit (1K = 1000)
                return Math.floor(number * 1000);
            case 'M':
                // Handle M unit (1M = 1000K = 1000*1000)
                return Math.floor(number * 1000 * 1000);
            case 'G':
                // Handle G unit (1G = 1000M = 1000*1000*1000)
                return Math.floor(number * 1000 * 1000 * 1000);
            case 'T':
                // Handle T unit (1T = 1000G = 1000*1000*1000*1000)
                return Math.floor(number * 1000 * 1000 * 1000 * 1000);
            case 'P':
                // Handle P unit (1P = 1000T = 1000*1000*1000*1000*1000)
                return Math.floor(number * 1000 * 1000 * 1000 * 1000 * 1000);
            default:
                return null;
        }
    } else {
        // If no unit, assume it's already in bytes
        const number = parseFloat(sizeStr);
        if (isNaN(number)) return null;
        return Math.floor(number);
    }
}

function handleStorageInput(event) {
    const value = event.target.value.trim();
    if (!value) {
        storageOutput.value = '';
        return;
    }
    
    const result = convertToComputerStorage(value);
    if (result === null) {
        storageOutput.value = '无效的输入格式';
    } else {
        storageOutput.value = result.toString();
    }
}

document.head.appendChild(style);
