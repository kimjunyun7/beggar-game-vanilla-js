document.addEventListener('DOMContentLoaded', () => {

    // 1. 게임 상태 변수
    const state = {
        money: 0,
        // 메인 캐릭터 자동수익
        autoIncome: {
            amount: 1,
            interval: 10000, // 10초 (밀리초 단위)
        },
        // 메인 캐릭터 수동수익
        manualIncome: {
            amount: 1,
            canEarn: true,
        },
        // 동료
        companion: {
            acquired: false,
            name: "멍멍이",
            autoIncome: {
                amount: 1,
                interval: 20000, // 20초
            }
        },
        // 업그레이드 비용
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
    const autoIncomeIntervalDisplay = document.getElementById('auto-income-interval-display');
    const autoIncomeAmountDisplay = document.getElementById('auto-income-amount-display');
    const manualIncomeAmountDisplay = document.getElementById('manual-income-amount-display');
    const manualCooldownDisplay = document.getElementById('manual-income-cooldown');
    
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

    // 4. 자동 수익 설정 함수
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

    // 5. 이벤트 리스너 (버튼 클릭, 키보드 입력 등)
    function addEventListeners() {
        // 방향키로 수동 수익
        document.addEventListener('keydown', (e) => {
            if(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                if(state.manualIncome.canEarn) {
                    state.money += state.manualIncome.amount;
                    state.manualIncome.canEarn = false;
                    manualCooldownDisplay.textContent = '1초 후 다시 가능합니다.';
                    updateUI();
                    setTimeout(() => {
                        state.manualIncome.canEarn = true;
                        manualCooldownDisplay.textContent = '';
                    }, 1000);
                }
            }
        });

        // 업그레이드: 자동수익 시간
        document.getElementById('upgrade-auto-time').addEventListener('click', () => {
            if (state.money >= state.costs.autoTime && state.autoIncome.interval > 5000) {
                state.money -= state.costs.autoTime;
                state.autoIncome.interval -= 10; // 0.01초 감소
                state.costs.autoTime = Math.floor(state.costs.autoTime * 1.05); // 비용 5% 증가
                setupAutoIncome();
                updateUI();
            }
        });

        // 업그레이드: 자동수익 금액
        document.getElementById('upgrade-auto-amount').addEventListener('click', () => {
            if (state.money >= state.costs.autoAmount) {
                state.money -= state.costs.autoAmount;
                state.autoIncome.amount += 1;
                state.costs.autoAmount = Math.floor(state.costs.autoAmount * 1.15); // 비용 15% 증가
                updateUI();
            }
        });

        // 업그레이드: 수동수익 금액
        document.getElementById('upgrade-manual-amount').addEventListener('click', () => {
            if (state.money >= state.costs.manualAmount) {
                state.money -= state.costs.manualAmount;
                state.manualIncome.amount += 1;
                state.costs.manualAmount = Math.floor(state.costs.manualAmount * 1.2); // 비용 20% 증가
                updateUI();
            }
        });

        // 동료 영입
        companionSection.acquireBtn.addEventListener('click', () => {
            if (state.money >= state.costs.acquireCompanion && !state.companion.acquired) {
                state.money -= state.costs.acquireCompanion;
                state.companion.acquired = true;
                setupCompanionAutoIncome();
                updateUI();
            }
        });
        
        // 동료 업그레이드: 시간
        document.getElementById('upgrade-companion-time').addEventListener('click', () => {
             if (state.money >= state.costs.companionTime && state.companion.autoIncome.interval > 10000) { // 최소 10초
                state.money -= state.costs.companionTime;
                state.companion.autoIncome.interval -= 10;
                state.costs.companionTime = Math.floor(state.costs.companionTime * 1.05);
                setupCompanionAutoIncome();
                updateUI();
            }
        });

        // 동료 업그레이드: 금액
        document.getElementById('upgrade-companion-amount').addEventListener('click', () => {
             if (state.money >= state.costs.companionAmount) {
                state.money -= state.costs.companionAmount;
                state.companion.autoIncome.amount += 1;
                state.costs.companionAmount = Math.floor(state.costs.companionAmount * 1.15);
                updateUI();
            }
        });

        // 동료 이름 변경
        companionSection.nameInput.addEventListener('change', () => {
            state.companion.name = companionSection.nameInput.value;
        });
        
        // 동료 이미지 변경
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

    // 6. 게임 초기화
    function init() {
        updateUI();
        setupAutoIncome();
        addEventListeners();
    }

    init();
});
