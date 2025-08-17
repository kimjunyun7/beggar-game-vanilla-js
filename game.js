document.addEventListener('DOMContentLoaded', () => {

    // --- DOM 요소 ---
    const startScreen = document.getElementById('start-screen');
    const newGameBtn = document.getElementById('new-game-btn');
    const loadGameBtn = document.getElementById('load-game-btn');
    const loadFileInput = document.getElementById('load-file-input');
    const gameContainer = document.getElementById('game-container');
    const saveGameBtn = document.getElementById('save-game-btn');
    // (이하 기존 요소들)
    const moneyDisplay = document.getElementById('money-display');
    const beggarImage = document.getElementById('beggar-image');
    // ... (나머지 모든 getElementById는 그대로 둡니다)
    const beggarLevelDisplay = document.getElementById('beggar-level');
    const expBarFill = document.getElementById('exp-bar-fill');
    const currentExpDisplay = document.getElementById('current-exp-display');
    const nextLevelExpDisplay = document.getElementById('next-level-exp-display');
    const companionsContainer = document.getElementById('companions-container');
    const autoIncomeIntervalDisplay = document.getElementById('auto-income-interval-display');
    const autoIncomeAmountDisplay = document.getElementById('auto-income-amount-display');
    const manualIncomeAmountDisplay = document.getElementById('manual-income-amount-display');
    const manualIncomeStatusIcon = document.getElementById('manual-income-status-icon');
    const costAutoTime = document.getElementById('cost-auto-time');
    const currentAutoTime = document.getElementById('current-auto-time');
    const costAutoAmount = document.getElementById('cost-auto-amount');
    const currentAutoAmount = document.getElementById('current-auto-amount');
    const costManualAmount = document.getElementById('cost-manual-amount');
    const currentManualAmount = document.getElementById('current-manual-amount');
    const companionTotalIncomeDisplay = document.getElementById('companion-total-income-display');

    let state = {}; // 게임 상태를 담을 변수
    let autoIncomeIntervals = [];

    // --- 게임 시작/종료 로직 ---
    newGameBtn.addEventListener('click', () => {
        const defaultState = { /* ... 기본 상태 객체 ... */ 
            money: 0, level: 1, totalMoneyEarned: 0, expForNextLevel: 0,
            autoIncome: { amount: 1, interval: 10000 },
            manualIncome: { amount: 1, canEarn: true },
            companions: [
                { name: "강아지", acquired: false, cost: 1000, level: 1, autoIncome: { amount: 1, interval: 20000 }, costs: { time: 500, amount: 1200 }, levels: { time: 0, amount: 1 }, maxLevel: { time: 10, amount: 500 } },
                { name: "고양이", acquired: false, cost: 30000, level: 1, autoIncome: { amount: 10, interval: 18000 }, costs: { time: 2500, amount: 6000 }, levels: { time: 0, amount: 1 }, maxLevel: { time: 10, amount: 400 } },
                { name: "비둘기", acquired: false, cost: 800000, level: 1, autoIncome: { amount: 50, interval: 16000 }, costs: { time: 12500, amount: 30000 }, levels: { time: 0, amount: 1 }, maxLevel: { time: 10, amount: 350 } },
                { name: "까치", acquired: false, cost: 40000000, level: 1, autoIncome: { amount: 250, interval: 14000 }, costs: { time: 62500, amount: 150000 }, levels: { time: 0, amount: 1 }, maxLevel: { time: 10, amount: 300 } },
                { name: "인공지능", acquired: false, cost: 2500000000, level: 1, autoIncome: { amount: 1250, interval: 12000 }, costs: { time: 312500, amount: 750000 }, levels: { time: 0, amount: 1 }, maxLevel: { time: 10, amount: 250 } },
                { name: "외계인", acquired: false, cost: 150000000000, level: 1, autoIncome: { amount: 6250, interval: 11000 }, costs: { time: 1562500, amount: 3750000 }, levels: { time: 0, amount: 1 }, maxLevel: { time: 10, amount: 200 } },
                { name: "드래곤", acquired: false, cost: 8000000000000, level: 1, autoIncome: { amount: 31250, interval: 10000 }, costs: { time: 7812500, amount: 18750000 }, levels: { time: 0, amount: 1 }, maxLevel: { time: 10, amount: 200 } }
            ],
            costs: { autoTime: 10, autoAmount: 50, manualAmount: 20 },
            levels: { autoTime: 0, autoAmount: 1, manualAmount: 1 },
            maxLevels: { autoAmount: 1000, manualAmount: 1000 }
        };
        startGame(defaultState);
    });

    loadGameBtn.addEventListener('click', () => {
        loadFileInput.click(); // 숨겨진 파일 인풋을 클릭
    });

    loadFileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const loadedState = JSON.parse(e.target.result);
                startGame(loadedState);
            } catch (error) {
                alert('잘못된 저장 파일입니다.');
            }
        };
        reader.readAsText(file);
    });

    function startGame(initialState) {
        state = initialState;
        startScreen.style.display = 'none';
        gameContainer.style.display = 'block';
        init(); // 게임 로직 초기화
    }

    // --- 저장 기능 ---
    saveGameBtn.addEventListener('click', () => {
        const dataStr = JSON.stringify(state);
        const dataBlob = new Blob([dataStr], { type: 'text/plain' });
        const url = window.URL.createObjectURL(dataBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'beggar-save.txt'; // 기본 저장 파일 이름
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    });

    // --- 이하 기존 게임 로직 ---
    function formatNumber(num) { /* ... */ 
        if (num < 1000) return Math.floor(num).toString();
        const suffixes = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const exp = Math.floor(Math.log(num) / Math.log(1000));
        const index = exp - 1;
        if (index >= suffixes.length) return 'MAX';
        const shortNum = (num / Math.pow(1000, exp));
        return shortNum.toFixed(2).replace(/\.00$/, '') + suffixes[index];
    }
    function calculateTotalExpForLevel(level) { /* ... */ 
        if (level <= 1) return 0;
        if (level <= 400) return Math.floor(100 * Math.pow(level - 1, 3.2));
        const expAt400 = Math.floor(100 * Math.pow(399, 3.2));
        if (level <= 800) return expAt400 + Math.floor(15000 * Math.pow(level - 400, 3.8));
        const expAt800 = expAt400 + Math.floor(15000 * Math.pow(400, 3.8));
        const lastIncrease = calculateTotalExpForLevel(800) - calculateTotalExpForLevel(799);
        return expAt800 + (level - 800) * lastIncrease;
    }
    function checkForLevelUp() { /* ... */ 
        while (state.totalMoneyEarned >= state.expForNextLevel) {
            state.level++;
            state.expForNextLevel = calculateTotalExpForLevel(state.level + 1);
        }
    }
    function earnMoney(amount) { /* ... */ 
        state.money += amount;
        state.totalMoneyEarned += amount;
        checkForLevelUp();
        updateUI();
    }
    function updateUI() { /* ... */ 
        moneyDisplay.textContent = formatNumber(state.money);
        beggarLevelDisplay.textContent = state.level;
        const expForPreviousLevel = calculateTotalExpForLevel(state.level);
        const currentLevelExp = state.totalMoneyEarned - expForPreviousLevel;
        const requiredExpForCurrentLevel = state.expForNextLevel - expForPreviousLevel;
        currentExpDisplay.textContent = formatNumber(currentLevelExp);
        nextLevelExpDisplay.textContent = formatNumber(requiredExpForCurrentLevel);
        const expPercentage = (currentLevelExp / requiredExpForCurrentLevel) * 100;
        expBarFill.style.width = `${Math.min(100, expPercentage)}%`;
        autoIncomeIntervalDisplay.textContent = (state.autoIncome.interval / 1000).toFixed(2);
        autoIncomeAmountDisplay.textContent = formatNumber(state.autoIncome.amount);
        manualIncomeAmountDisplay.textContent = formatNumber(state.manualIncome.amount);
        manualIncomeStatusIcon.className = state.manualIncome.canEarn ? 'ready' : 'cooldown';
        costAutoTime.textContent = formatNumber(state.costs.autoTime);
        currentAutoTime.textContent = (state.autoIncome.interval / 1000).toFixed(2);
        costAutoAmount.textContent = formatNumber(state.costs.autoAmount);
        currentAutoAmount.textContent = formatNumber(state.autoIncome.amount);
        costManualAmount.textContent = formatNumber(state.costs.manualAmount);
        currentManualAmount.textContent = formatNumber(state.manualIncome.amount);
        let totalCompanionIncomePerSecond = 0;
        let hasCompanions = false;
        state.companions.forEach(c => {
            if (c.acquired) {
                totalCompanionIncomePerSecond += c.autoIncome.amount / (c.autoIncome.interval / 1000);
                hasCompanions = true;
            }
        });
        if (hasCompanions) {
            companionTotalIncomeDisplay.style.display = 'block';
            companionTotalIncomeDisplay.querySelector('span').textContent = formatNumber(totalCompanionIncomePerSecond);
        } else {
            companionTotalIncomeDisplay.style.display = 'none';
        }
        renderCompanions();
    }
    function handleManualIncome() { /* ... */ 
        if (state.manualIncome.canEarn) {
            state.manualIncome.canEarn = false;
            earnMoney(state.manualIncome.amount);
            setTimeout(() => { state.manualIncome.canEarn = true; updateUI(); }, 3000);
        }
    }
    function setupAllAutoIncomes() { /* ... */ 
        if (autoIncomeIntervals[0]) clearInterval(autoIncomeIntervals[0]);
        autoIncomeIntervals[0] = setInterval(() => earnMoney(state.autoIncome.amount), state.autoIncome.interval);
        state.companions.forEach((companion, index) => {
            if (autoIncomeIntervals[index + 1]) clearInterval(autoIncomeIntervals[index + 1]);
            if (companion.acquired) {
                autoIncomeIntervals[index + 1] = setInterval(() => earnMoney(companion.autoIncome.amount), companion.autoIncome.interval);
            }
        });
    }
    function addEventListeners() { /* ... */ 
        function spendMoney(cost) { state.money -= cost; updateUI(); }
        document.addEventListener('keydown', (e) => { if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) handleManualIncome(); });
        beggarImage.addEventListener('click', handleManualIncome);
        document.getElementById('upgrade-auto-time').addEventListener('click', () => {
            if (state.money >= state.costs.autoTime && state.autoIncome.interval > 5000) {
                spendMoney(state.costs.autoTime);
                state.autoIncome.interval -= 10;
                state.levels.autoTime++;
                state.costs.autoTime = 10 + (state.levels.autoTime * 8);
                setupAllAutoIncomes(); updateUI();
            }
        });
        document.getElementById('upgrade-auto-amount').addEventListener('click', () => {
            if (state.money >= state.costs.autoAmount && state.levels.autoAmount < state.maxLevels.autoAmount) {
                spendMoney(state.costs.autoAmount);
                state.autoIncome.amount += 1 + Math.floor(state.levels.autoAmount / 10);
                state.levels.autoAmount++;
                state.costs.autoAmount = 50 + Math.floor(Math.pow(state.levels.autoAmount, 2.2));
                updateUI();
            }
        });
        document.getElementById('upgrade-manual-amount').addEventListener('click', () => {
            if (state.money >= state.costs.manualAmount && state.levels.manualAmount < state.maxLevels.manualAmount) {
                spendMoney(state.costs.manualAmount);
                state.manualIncome.amount += 1 + Math.floor(state.levels.manualAmount / 10);
                state.levels.manualAmount++;
                state.costs.manualAmount = 20 + Math.floor(Math.pow(state.levels.manualAmount, 2.3));
                updateUI();
            }
        });
    }
    function renderCompanions() { /* ... */ 
        companionsContainer.innerHTML = '<h3>동료</h3>';
        let previousCompanionAcquired = true;
        state.companions.forEach((companion, index) => {
            const card = document.createElement('div');
            card.className = 'companion-card';
            if (companion.acquired) {
                card.innerHTML = `
                    <div class="has-companion">
                        <div class="character-box small">
                            <img src="images/dog.png" alt="${companion.name}" />
                            <p>${companion.name} (LV.${companion.level})</p>
                        </div>
                        <div class="companion-status">
                            <p>자동수익: ${(companion.autoIncome.interval/1000).toFixed(2)}초 마다 ${formatNumber(companion.autoIncome.amount)}원</p>
                            <div class="upgrade-item">
                                <span>속도 향상 (-1.00초)</span>
                                <div class="upgrade-details">
                                    <small>비용: ${formatNumber(companion.costs.time)}원</small>
                                    <button data-index="${index}" data-type="time">구매</button>
                                </div>
                            </div>
                            <div class="upgrade-item">
                                <span>수익 증가</span>
                                <div class="upgrade-details">
                                    <small>비용: ${formatNumber(companion.costs.amount)}원</small>
                                    <button data-index="${index}" data-type="amount">구매</button>
                                </div>
                            </div>
                        </div>
                    </div>`;
            } else if (previousCompanionAcquired) {
                card.classList.add('locked');
                card.innerHTML = `<button data-index="${index}" data-type="acquire">${companion.name} 영입하기 (비용: ${formatNumber(companion.cost)}원)</button>`;
                previousCompanionAcquired = false;
            }
            companionsContainer.appendChild(card);
        });
        companionsContainer.querySelectorAll('button').forEach(button => {
            button.addEventListener('click', handleCompanionAction);
        });
    }
    function handleCompanionAction(event) { /* ... */ 
        const { index, type } = event.target.dataset;
        const companion = state.companions[index];
        if (!companion) return;
        if (type === 'acquire') {
            if (state.money >= companion.cost) {
                state.money -= companion.cost;
                companion.acquired = true;
                setupAllAutoIncomes(); updateUI();
            }
        } else if (type === 'time') {
            if (state.money >= companion.costs.time && companion.levels.time < companion.maxLevel.time) {
                state.money -= companion.costs.time;
                companion.autoIncome.interval -= 1000;
                companion.levels.time++;
                companion.costs.time *= 3.5;
                setupAllAutoIncomes(); updateUI();
            }
        } else if (type === 'amount') {
            if (state.money >= companion.costs.amount && companion.levels.amount < companion.maxLevel.amount) {
                state.money -= companion.costs.amount;
                if (parseInt(index) === 6 && companion.levels.amount >= 199) {
                     companion.autoIncome.amount += 400 - companion.autoIncome.amount;
                } else {
                     companion.autoIncome.amount += 1 + Math.floor(companion.levels.amount * (index + 1) * 0.5);
                }
                companion.levels.amount++;
                companion.level++;
                companion.costs.amount += Math.floor(Math.pow(companion.levels.amount, 2.0 + index * 0.1));
                updateUI();
            }
        }
    }

    function init() {
        state.expForNextLevel = calculateTotalExpForLevel(state.level + 1);
        setupAllAutoIncomes();
        addEventListeners();
        updateUI();
    }
});