document.addEventListener('DOMContentLoaded', () => {

    // 1. 게임 상태 변수 (레벨 시스템 추가)
    const state = {
        money: 0,
        level: 1, // 캐릭터 레벨
        totalMoneyEarned: 0, // 총 번 돈 (경험치)
        expForNextLevel: 0, // 다음 레벨에 필요한 총 경험치
        autoIncome: { amount: 1, interval: 10000 },
        manualIncome: { amount: 1, canEarn: true },
        companion: {
            acquired: false, name: "멍멍이",
            autoIncome: { amount: 1, interval: 20000 }
        },
        costs: {
            autoTime: 10, autoAmount: 50, manualAmount: 20,
            acquireCompanion: 1000, companionTime: 500, companionAmount: 1000,
        },
        levels: {
            autoTime: 0, autoAmount: 1, manualAmount: 1,
            companionTime: 0, companionAmount: 1,
        }
    };

    // 2. DOM 요소 가져오기 (레벨 관련 요소 추가)
    const moneyDisplay = document.getElementById('money-display');
    const beggarImage = document.getElementById('beggar-image');
    const beggarLevelDisplay = document.getElementById('beggar-level');
    const expBarFill = document.getElementById('exp-bar-fill');
    const currentExpDisplay = document.getElementById('current-exp-display');
    const nextLevelExpDisplay = document.getElementById('next-level-exp-display');

    // (이하 기존 DOM 요소들...)
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
    const companionSection = {
        noCompanion: document.getElementById('no-companion'), hasCompanion: document.getElementById('has-companion'),
        acquireBtn: document.getElementById('acquire-companion'), image: document.getElementById('companion-image'),
        nameInput: document.getElementById('companion-name-input'), imageUpload: document.getElementById('companion-image-upload'),
        intervalDisplay: document.getElementById('companion-income-interval-display'),
        amountDisplay: document.getElementById('companion-income-amount-display'), costTime: document.getElementById('cost-companion-time'),
        costAmount: document.getElementById('cost-companion-amount'),
        upgradeCompanionTimeBtn: document.getElementById('upgrade-companion-time'),
        companionTimeUpgradeSpan: document.querySelector('#upgrade-companion-time-item span'),
    };

    let mainAutoIncomeInterval;
    let companionAutoIncomeInterval;

    // 3. 레벨 및 경험치 관련 함수
    // 다음 레벨에 필요한 '총 누적 경험치'를 계산하는 핵심 함수
    function calculateTotalExpForLevel(level) {
        if (level <= 1) return 0;

        // Phase 1: 초반 (LV 1 ~ 400)
        if (level <= 400) {
            return Math.floor(100 * Math.pow(level - 1, 3.2));
        }

        const expAt400 = Math.floor(100 * Math.pow(399, 3.2));
        // Phase 2: 중반 (LV 401 ~ 800)
        if (level <= 800) {
            return expAt400 + Math.floor(15000 * Math.pow(level - 400, 3.8));
        }

        // Phase 3: 후반 (LV 801 ~ )
        const expAt800 = expAt400 + Math.floor(15000 * Math.pow(400, 3.8));
        const lastIncrease = calculateTotalExpForLevel(800) - calculateTotalExpForLevel(799); // 증가량 고정
        return expAt800 + (level - 800) * lastIncrease;
    }

    function checkForLevelUp() {
        while (state.totalMoneyEarned >= state.expForNextLevel) {
            state.level++;
            state.expForNextLevel = calculateTotalExpForLevel(state.level + 1);
        }
    }

    // 돈을 버는 모든 곳에 경험치 획득 로직 추가
    function earnMoney(amount) {
        state.money += amount;
        state.totalMoneyEarned += amount;
        checkForLevelUp(); // 돈 벌 때마다 레벨업 체크
        updateUI();
    }

    // 4. UI 업데이트 함수 (레벨/경험치 표시 로직 추가)
    function updateUI() {
        moneyDisplay.textContent = Math.floor(state.money);
        beggarLevelDisplay.textContent = state.level;

        // 경험치 바 및 텍스트 업데이트
        const expForPreviousLevel = calculateTotalExpForLevel(state.level);
        const currentLevelExp = state.totalMoneyEarned - expForPreviousLevel;
        const requiredExpForCurrentLevel = state.expForNextLevel - expForPreviousLevel;

        currentExpDisplay.textContent = Math.floor(currentLevelExp).toLocaleString();
        nextLevelExpDisplay.textContent = Math.floor(requiredExpForCurrentLevel).toLocaleString();

        const expPercentage = (currentLevelExp / requiredExpForCurrentLevel) * 100;
        expBarFill.style.width = `${Math.min(100, expPercentage)}%`;

        // (이하 기존 UI 업데이트 로직...)
        autoIncomeIntervalDisplay.textContent = (state.autoIncome.interval / 1000).toFixed(2);
        autoIncomeAmountDisplay.textContent = state.autoIncome.amount;
        manualIncomeAmountDisplay.textContent = state.manualIncome.amount;
        if (state.manualIncome.canEarn) { manualIncomeStatusIcon.className = 'ready'; } 
        else { manualIncomeStatusIcon.className = 'cooldown'; }
        costAutoTime.textContent = state.costs.autoTime;
        currentAutoTime.textContent = (state.autoIncome.interval / 1000).toFixed(2);
        costAutoAmount.textContent = state.costs.autoAmount;
        currentAutoAmount.textContent = state.autoIncome.amount;
        costManualAmount.textContent = state.costs.manualAmount;
        currentManualAmount.textContent = state.manualIncome.amount;
        if (state.companion.acquired) {
            companionSection.noCompanion.style.display = 'none';
            companionSection.hasCompanion.style.display = 'flex';
            companionSection.nameInput.value = state.companion.name;
            companionSection.intervalDisplay.textContent = (state.companion.autoIncome.interval / 1000).toFixed(2);
            companionSection.amountDisplay.textContent = state.companion.autoIncome.amount;
            companionSection.costTime.textContent = state.costs.companionTime;
            companionSection.costAmount.textContent = state.costs.companionAmount;
            if (state.levels.companionTime >= 10) {
                companionSection.upgradeCompanionTimeBtn.disabled = true;
                companionSection.upgradeCompanionTimeBtn.textContent = "최대 레벨";
                companionSection.companionTimeUpgradeSpan.textContent = "동료 속도 (최대)";
            }
        } else {
            companionSection.acquireBtn.textContent = `강아지 영입하기 (비용: ${state.costs.acquireCompanion}원)`;
        }
    }

    // 5. 수동 수익 처리 함수 (earnMoney 호출로 변경)
    function handleManualIncome() {
        if (state.manualIncome.canEarn) {
            state.manualIncome.canEarn = false;
            earnMoney(state.manualIncome.amount); // earnMoney를 통해 돈과 경험치를 동시에 획득

            setTimeout(() => {
                state.manualIncome.canEarn = true;
                updateUI(); // 아이콘 상태만 변경하기 위해 호출
            }, 3000);
        }
    }

    // 6. 자동 수익 설정 함수 (earnMoney 호출로 변경)
    function setupAutoIncome() {
        if (mainAutoIncomeInterval) clearInterval(mainAutoIncomeInterval);
        mainAutoIncomeInterval = setInterval(() => {
            earnMoney(state.autoIncome.amount);
        }, state.autoIncome.interval);
    }

    function setupCompanionAutoIncome() {
        if (companionAutoIncomeInterval) clearInterval(companionAutoIncomeInterval);
        if (state.companion.acquired) {
            companionAutoIncomeInterval = setInterval(() => {
                earnMoney(state.companion.autoIncome.amount);
            }, state.companion.autoIncome.interval);
        }
    }

    // 7. 이벤트 리스너 (기존과 거의 동일, 비용 지불 로직만 수정)
    function addEventListeners() {
        // 돈을 '사용'하는 부분은 earnMoney를 호출하지 않음
        function spendMoney(cost) {
            state.money -= cost;
            updateUI();
        }

        document.addEventListener('keydown', (e) => {
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) handleManualIncome();
        });
        beggarImage.addEventListener('click', handleManualIncome);

        document.getElementById('upgrade-auto-time').addEventListener('click', () => {
            if (state.money >= state.costs.autoTime && state.autoIncome.interval > 5000) {
                spendMoney(state.costs.autoTime);
                state.autoIncome.interval -= 10;
                state.levels.autoTime++;
                state.costs.autoTime = 10 + (state.levels.autoTime * 8);
                setupAutoIncome();
                updateUI();
            }
        });

        document.getElementById('upgrade-auto-amount').addEventListener('click', () => {
            if (state.money >= state.costs.autoAmount) {
                spendMoney(state.costs.autoAmount);
                state.autoIncome.amount += 1;
                state.levels.autoAmount++;
                state.costs.autoAmount = 50 + Math.floor(Math.pow(state.levels.autoAmount, 1.8) * 20);
                updateUI();
            }
        });

        // (이하 다른 업그레이드 버튼들도 spendMoney 로직으로 동일하게 적용)
        document.getElementById('upgrade-manual-amount').addEventListener('click', () => {
            if (state.money >= state.costs.manualAmount) {
                spendMoney(state.costs.manualAmount);
                state.manualIncome.amount += 1;
                state.levels.manualAmount++;
                state.costs.manualAmount = 20 + Math.floor(Math.pow(state.levels.manualAmount, 1.9) * 15);
                updateUI();
            }
        });

        companionSection.acquireBtn.addEventListener('click', () => {
            if (state.money >= state.costs.acquireCompanion && !state.companion.acquired) {
                spendMoney(state.costs.acquireCompanion);
                state.companion.acquired = true;
                setupCompanionAutoIncome();
                updateUI();
            }
        });

        companionSection.upgradeCompanionTimeBtn.addEventListener('click', () => {
             if (state.money >= state.costs.companionTime && state.levels.companionTime < 10) {
                spendMoney(state.costs.companionTime);
                state.companion.autoIncome.interval -= 1000;
                state.levels.companionTime++;
                state.costs.companionTime = 500 * Math.pow(3, state.levels.companionTime);
                setupCompanionAutoIncome();
                updateUI();
            }
        });

        document.getElementById('upgrade-companion-amount').addEventListener('click', () => {
             if (state.money >= state.costs.companionAmount) {
                spendMoney(state.costs.companionAmount);
                state.companion.autoIncome.amount += 1;
                state.levels.companionAmount++;
                state.costs.companionAmount = 1000 + Math.floor(Math.pow(state.levels.companionAmount, 1.8) * 40);
                updateUI();
            }
        });

        companionSection.nameInput.addEventListener('change', () => { state.companion.name = companionSection.nameInput.value; });
        companionSection.imageUpload.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => { companionSection.image.src = e.target.result; }
                reader.readAsDataURL(file);
            }
        });
    }

    // 8. 게임 초기화
    function init() {
        state.expForNextLevel = calculateTotalExpForLevel(state.level + 1);
        setupAutoIncome();
        addEventListeners();
        updateUI(); // 게임 시작 시 UI를 한번 그려줌
    }

    init();
});