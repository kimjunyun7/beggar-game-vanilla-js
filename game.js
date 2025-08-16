document.addEventListener('DOMContentLoaded', () => {

    // 1. 게임 상태 변수
    const state = {
        money: 0,
        autoIncome: { amount: 1, interval: 10000 },
        manualIncome: { amount: 1, canEarn: true },
        companion: {
            acquired: false,
            name: "멍멍이",
            autoIncome: { amount: 1, interval: 20000 }
        },
        costs: {
            autoTime: 10,
            autoAmount: 50,
            manualAmount: 20,
            acquireCompanion: 1000,
            companionTime: 500,
            companionAmount: 1000,
        }
    };

    // 2. DOM 요소 가져오기
    const moneyDisplay = document.getElementById('money-display');
    const beggarImage = document.getElementById('beggar-image'); // 거지 이미지
    const autoIncomeIntervalDisplay = document.getElementById('auto-income-interval-display');
    const autoIncomeAmountDisplay = document.getElementById('auto-income-amount-display');
    const manualIncomeAmountDisplay = document.getElementById('manual-income-amount-display');
    const manualIncomeStatusIcon = document.getElementById('manual-income-status-icon'); // 상태 아이콘
    
    // ... (나머지 DOM 요소는 동일)
    const costAutoTime = document.getElementById('cost-auto-time');
    const currentAutoTime = document.getElementById('current-auto-time');
    const costAutoAmount = document.getElementById('cost-auto-amount');
    const currentAutoAmount = document.getElementById('current-auto-amount');
    const costManualAmount = document.getElementById('cost-manual-amount');
    const currentManualAmount = document.getElementById('current-manual-amount');

    const companionSection = {
        noCompanion: document.getElementById('no-companion'),
        hasCompanion: document.getElementById('has-companion'),
        acquireBtn: document.getElementById('acquire-companion'),
        image: document.getElementById('companion-image'),
        nameInput: document.getElementById('companion-name-input'),
        imageUpload: document.getElementById('companion-image-upload'),
        intervalDisplay: document.getElementById('companion-income-interval-display'),
        amountDisplay: document.getElementById('companion-income-amount-display'),
        costTime: document.getElementById('cost-companion-time'),
        costAmount: document.getElementById('cost-companion-amount'),
    };

    let mainAutoIncomeInterval;
    let companionAutoIncomeInterval;

    // 3. UI 업데이트 함수
    function updateUI() {
        moneyDisplay.textContent = Math.floor(state.money);
        
        // 메인 캐릭터 정보
        autoIncomeIntervalDisplay.textContent = (state.autoIncome.interval / 1000).toFixed(2);
        autoIncomeAmountDisplay.textContent = state.autoIncome.amount;
        manualIncomeAmountDisplay.textContent = state.manualIncome.amount;
        
        // 수동수익 상태 아이콘 업데이트
        if (state.manualIncome.canEarn) {
            manualIncomeStatusIcon.classList.remove('cooldown');
            manualIncomeStatusIcon.classList.add('ready');
        } else {
            manualIncomeStatusIcon.classList.remove('ready');
            manualIncomeStatusIcon.classList.add('cooldown');
        }

        costAutoTime.textContent = state.costs.autoTime;
        currentAutoTime.textContent = (state.autoIncome.interval / 1000).toFixed(2);
        costAutoAmount.textContent = state.costs.autoAmount;
        currentAutoAmount.textContent = state.autoIncome.amount;
        costManualAmount.textContent = state.costs.manualAmount;
        currentManualAmount.textContent = state.manualIncome.amount;
        
        // 동료 정보
        if(state.companion.acquired) {
            companionSection.noCompanion.style.display = 'none';
            companionSection.hasCompanion.style.display = 'flex';
            companionSection.nameInput.value = state.companion.name;
            companionSection.intervalDisplay.textContent = (state.companion.autoIncome.interval / 1000).toFixed(2);
            companionSection.amountDisplay.textContent = state.companion.autoIncome.amount;
            companionSection.costTime.textContent = state.costs.companionTime;
            companionSection.costAmount.textContent = state.costs.companionAmount;
        } else {
            companionSection.acquireBtn.textContent = `강아지 영입하기 (비용: ${state.costs.acquireCompanion}원)`;
        }
    }

    // 4. 수동 수익 획득 및 쿨타임 처리 함수
    function handleManualIncome() {
        if (state.manualIncome.canEarn) {
            state.money += state.manualIncome.amount;
            state.manualIncome.canEarn = false;
            updateUI(); // 즉시 UI 업데이트하여 아이콘 색 변경
            
            setTimeout(() => {
                state.manualIncome.canEarn = true;
                updateUI(); // 쿨타임 종료 후 다시 UI 업데이트
            }, 3000); // 쿨타임을 3초로 변경
        }
    }

    // 5. 자동 수익 설정 함수
    function setupAutoIncome() {
        if(mainAutoIncomeInterval) clearInterval(mainAutoIncomeInterval);
        mainAutoIncomeInterval = setInterval(() => {
            state.money += state.autoIncome.amount;
            updateUI();
        }, state.autoIncome.interval);
    }

    function setupCompanionAutoIncome() {
        if(companionAutoIncomeInterval) clearInterval(companionAutoIncomeInterval);
        if(state.companion.acquired) {
            companionAutoIncomeInterval = setInterval(() => {
                state.money += state.companion.autoIncome.amount;
                updateUI();
            }, state.companion.autoIncome.interval);
        }
    }

    // 6. 이벤트 리스너
    function addEventListeners() {
        // 방향키로 수동 수익
        document.addEventListener('keydown', (e) => {
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                handleManualIncome();
            }
        });
        
        // 이미지 클릭으로 수동 수익
        beggarImage.addEventListener('click', () => {
            handleManualIncome();
        });

        // 업그레이드: 자동수익 시간
        document.getElementById('upgrade-auto-time').addEventListener('click', () => {
            if (state.money >= state.costs.autoTime && state.autoIncome.interval > 5000) {
                state.money -= state.costs.autoTime;
                state.autoIncome.interval -= 10;
                state.costs.autoTime = Math.floor(state.costs.autoTime * 1.05);
                setupAutoIncome();
                updateUI();
            }
        });

        // 업그레이드: 자동수익 금액
        document.getElementById('upgrade-auto-amount').addEventListener('click', () => {
            if (state.money >= state.costs.autoAmount) {
                state.money -= state.costs.autoAmount;
                state.autoIncome.amount += 1;
                state.costs.autoAmount = Math.floor(state.costs.autoAmount * 1.15);
                updateUI();
            }
        });

        // 업그레이드: 수동수익 금액
        document.getElementById('upgrade-manual-amount').addEventListener('click', () => {
            if (state.money >= state.costs.manualAmount) {
                state.money -= state.costs.manualAmount;
                state.manualIncome.amount += 1;
                state.costs.manualAmount = Math.floor(state.costs.manualAmount * 1.2);
                updateUI();
            }
        });
        
        // ... (동료 관련 이벤트 리스너는 동일)
        companionSection.acquireBtn.addEventListener('click', () => {
            if (state.money >= state.costs.acquireCompanion && !state.companion.acquired) {
                state.money -= state.costs.acquireCompanion;
                state.companion.acquired = true;
                setupCompanionAutoIncome();
                updateUI();
            }
        });
        
        document.getElementById('upgrade-companion-time').addEventListener('click', () => {
             if (state.money >= state.costs.companionTime && state.companion.autoIncome.interval > 10000) {
                state.money -= state.costs.companionTime;
                state.companion.autoIncome.interval -= 10;
                state.costs.companionTime = Math.floor(state.costs.companionTime * 1.05);
                setupCompanionAutoIncome();
                updateUI();
            }
        });

        document.getElementById('upgrade-companion-amount').addEventListener('click', () => {
             if (state.money >= state.costs.companionAmount) {
                state.money -= state.costs.companionAmount;
                state.companion.autoIncome.amount += 1;
                state.costs.companionAmount = Math.floor(state.costs.companionAmount * 1.15);
                updateUI();
            }
        });

        companionSection.nameInput.addEventListener('change', () => {
            state.companion.name = companionSection.nameInput.value;
        });
        
        companionSection.imageUpload.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    companionSection.image.src = e.target.result;
                }
                reader.readAsDataURL(file);
            }
        });
    }

    // 7. 게임 초기화
    function init() {
        updateUI();
        setupAutoIncome();
        addEventListeners();
    }

    init();
});