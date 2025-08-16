/**
 * Beggar Game - A simple incremental clicker game
 * Pure vanilla JavaScript implementation
 */

class BeggarGame {
    constructor() {
        // Game state
        this.money = 0;
        this.moneyPerSecond = 0;
        this.moneyPerClick = 1;
        this.level = 1;
        
        // Upgrade states
        this.upgrades = {
            appearance: { purchased: false, cost: 10, clickBonus: 1 },
            location: { purchased: false, cost: 50, passiveBonus: 2 },
            dog: { purchased: false, cost: 200, passiveBonus: 5 },
            sign: { purchased: false, cost: 100, clickBonus: 3 },
            cup: { purchased: false, cost: 500, multiplier: 2 }
        };
        
        // Game elements
        this.elements = {};
        
        // Game loop
        this.gameLoop = null;
        this.autoSaveInterval = null;
        
        // Initialize the game
        this.init();
    }
    
    /**
     * Initialize the game
     */
    init() {
        this.cacheElements();
        this.bindEvents();
        this.loadGame();
        this.startGameLoop();
        this.startAutoSave();
        this.updateDisplay();
    }
    
    /**
     * Cache DOM elements for performance
     */
    cacheElements() {
        this.elements = {
            money: document.getElementById('money'),
            moneyPerSecond: document.getElementById('moneyPerSecond'),
            level: document.getElementById('level'),
            beggar: document.getElementById('beggar'),
            dog: document.getElementById('dog'),
            begButton: document.getElementById('begButton'),
            moneyParticles: document.getElementById('moneyParticles'),
            floatingMoney: document.getElementById('floatingMoney'),
            
            // Upgrade elements
            buyAppearance: document.getElementById('buyAppearance'),
            buyLocation: document.getElementById('buyLocation'),
            buyDog: document.getElementById('buyDog'),
            buySign: document.getElementById('buySign'),
            buyCup: document.getElementById('buyCup'),
            
            // Cost displays
            appearanceCost: document.getElementById('appearanceCost'),
            locationCost: document.getElementById('locationCost'),
            dogCost: document.getElementById('dogCost'),
            signCost: document.getElementById('signCost'),
            cupCost: document.getElementById('cupCost'),
            
            // Control buttons
            saveGame: document.getElementById('saveGame'),
            resetGame: document.getElementById('resetGame')
        };
    }
    
    /**
     * Bind event listeners
     */
    bindEvents() {
        // Main beg button
        this.elements.begButton.addEventListener('click', () => this.beg());
        
        // Upgrade buttons
        this.elements.buyAppearance.addEventListener('click', () => this.buyUpgrade('appearance'));
        this.elements.buyLocation.addEventListener('click', () => this.buyUpgrade('location'));
        this.elements.buyDog.addEventListener('click', () => this.buyUpgrade('dog'));
        this.elements.buySign.addEventListener('click', () => this.buyUpgrade('sign'));
        this.elements.buyCup.addEventListener('click', () => this.buyUpgrade('cup'));
        
        // Control buttons
        this.elements.saveGame.addEventListener('click', () => this.saveGame());
        this.elements.resetGame.addEventListener('click', () => this.resetGame());
        
        // Character click events
        this.elements.beggar.addEventListener('click', () => this.beg());
    }
    
    /**
     * Main beg action - player clicks to earn money
     */
    beg() {
        let earnings = this.moneyPerClick;
        
        // Apply cup multiplier if purchased
        if (this.upgrades.cup.purchased) {
            earnings *= this.upgrades.cup.multiplier;
        }
        
        this.money += earnings;
        this.updateLevel();
        this.createMoneyParticle(earnings);
        this.animateBeggar();
        this.updateDisplay();
        
        // Play click sound effect (visual feedback)
        this.pulseElement(this.elements.beggar);
    }
    
    /**
     * Buy an upgrade
     */
    buyUpgrade(upgradeType) {
        const upgrade = this.upgrades[upgradeType];
        
        if (upgrade.purchased) {
            this.showMessage('Already purchased!');
            return;
        }
        
        if (this.money < upgrade.cost) {
            this.showMessage('Not enough money!');
            this.shakeElement(this.elements[upgradeType + 'Cost']);
            return;
        }
        
        // Deduct cost and mark as purchased
        this.money -= upgrade.cost;
        upgrade.purchased = true;
        
        // Apply upgrade effects
        this.applyUpgrade(upgradeType, upgrade);
        
        // Update display
        this.updateDisplay();
        this.updateUpgradeButtons();
        
        // Show success feedback
        this.showMessage(`${upgradeType.charAt(0).toUpperCase() + upgradeType.slice(1)} upgrade purchased!`);
        this.pulseElement(document.getElementById('upgrade-' + upgradeType));
    }
    
    /**
     * Apply upgrade effects
     */
    applyUpgrade(upgradeType, upgrade) {
        switch(upgradeType) {
            case 'appearance':
                this.moneyPerClick += upgrade.clickBonus;
                this.improveAppearance();
                break;
            case 'location':
                this.moneyPerSecond += upgrade.passiveBonus;
                break;
            case 'dog':
                this.moneyPerSecond += upgrade.passiveBonus;
                this.showDog();
                break;
            case 'sign':
                this.moneyPerClick += upgrade.clickBonus;
                this.addSign();
                break;
            case 'cup':
                // Cup provides multiplier, applied in beg() method
                this.addCup();
                break;
        }
    }
    
    /**
     * Visual upgrade effects
     */
    improveAppearance() {
        this.elements.beggar.classList.add('improved');
        this.elements.beggar.style.filter = 'brightness(1.2)';
    }
    
    showDog() {
        this.elements.dog.style.display = 'block';
        this.elements.dog.classList.add('bounce');
    }
    
    addSign() {
        if (!document.querySelector('.cardboard-sign')) {
            const sign = document.createElement('div');
            sign.className = 'cardboard-sign';
            sign.innerHTML = 'NEED HELP';
            sign.style.cssText = `
                position: absolute;
                top: -40px;
                left: 50%;
                transform: translateX(-50%);
                background: #8b7355;
                color: #2c3e50;
                padding: 5px 10px;
                border: 2px solid #654321;
                border-radius: 5px;
                font-size: 12px;
                font-weight: bold;
            `;
            this.elements.beggar.appendChild(sign);
        }
    }
    
    addCup() {
        if (!document.querySelector('.donation-cup')) {
            const cup = document.createElement('div');
            cup.className = 'donation-cup';
            cup.style.cssText = `
                position: absolute;
                bottom: -20px;
                right: -30px;
                width: 25px;
                height: 30px;
                background: #95a5a6;
                border: 2px solid #7f8c8d;
                border-radius: 0 0 10px 10px;
            `;
            this.elements.beggar.appendChild(cup);
        }
    }
    
    /**
     * Update player level based on money earned
     */
    updateLevel() {
        const newLevel = Math.floor(this.money / 100) + 1;
        if (newLevel > this.level) {
            this.level = newLevel;
            this.showMessage(`Level up! You are now level ${this.level}!`);
            this.pulseElement(this.elements.level.parentElement);
        }
    }
    
    /**
     * Create floating money particle effect
     */
    createMoneyParticle(amount) {
        const particle = document.createElement('div');
        particle.className = 'money-particle';
        particle.textContent = `+$${amount}`;
        
        // Random position around the beg button
        const buttonRect = this.elements.begButton.getBoundingClientRect();
        particle.style.left = (buttonRect.left + Math.random() * buttonRect.width) + 'px';
        particle.style.top = (buttonRect.top - 20) + 'px';
        
        this.elements.moneyParticles.appendChild(particle);
        
        // Remove particle after animation
        setTimeout(() => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
        }, 2000);
    }
    
    /**
     * Create floating coin effect
     */
    createFloatingCoin() {
        const coin = document.createElement('div');
        coin.className = 'floating-coin';
        coin.textContent = '$';
        
        // Random starting position
        coin.style.left = Math.random() * window.innerWidth + 'px';
        coin.style.top = window.innerHeight + 'px';
        
        this.elements.floatingMoney.appendChild(coin);
        
        // Remove coin after animation
        setTimeout(() => {
            if (coin.parentNode) {
                coin.parentNode.removeChild(coin);
            }
        }, 3000);
    }
    
    /**
     * Animate beggar character
     */
    animateBeggar() {
        this.elements.beggar.classList.add('bounce');
        setTimeout(() => {
            this.elements.beggar.classList.remove('bounce');
        }, 800);
    }
    
    /**
     * Pulse animation for elements
     */
    pulseElement(element) {
        element.classList.add('pulse');
        setTimeout(() => {
            element.classList.remove('pulse');
        }, 600);
    }
    
    /**
     * Shake animation for elements
     */
    shakeElement(element) {
        element.classList.add('shake');
        setTimeout(() => {
            element.classList.remove('shake');
        }, 500);
    }
    
    /**
     * Show temporary message to player
     */
    showMessage(message) {
        // Remove existing message
        const existingMessage = document.querySelector('.game-message');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        const messageEl = document.createElement('div');
        messageEl.className = 'game-message';
        messageEl.textContent = message;
        messageEl.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.8);
            color: #f39c12;
            padding: 15px 25px;
            border-radius: 10px;
            border: 2px solid #f39c12;
            font-weight: bold;
            z-index: 2000;
            animation: messageAppear 2s ease-out forwards;
        `;
        
        // Add CSS animation
        if (!document.querySelector('#messageAnimations')) {
            const style = document.createElement('style');
            style.id = 'messageAnimations';
            style.textContent = `
                @keyframes messageAppear {
                    0% { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
                    20% { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
                    30% { transform: translate(-50%, -50%) scale(1); }
                    80% { opacity: 1; }
                    100% { opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(messageEl);
        
        // Remove message after animation
        setTimeout(() => {
            if (messageEl.parentNode) {
                messageEl.parentNode.removeChild(messageEl);
            }
        }, 2000);
    }
    
    /**
     * Update all display elements
     */
    updateDisplay() {
        this.elements.money.textContent = `$${Math.floor(this.money)}`;
        this.elements.moneyPerSecond.textContent = `$${this.moneyPerSecond}`;
        this.elements.level.textContent = this.level;
        
        this.updateUpgradeButtons();
    }
    
    /**
     * Update upgrade button states
     */
    updateUpgradeButtons() {
        Object.keys(this.upgrades).forEach(upgradeType => {
            const upgrade = this.upgrades[upgradeType];
            const button = this.elements['buy' + upgradeType.charAt(0).toUpperCase() + upgradeType.slice(1)];
            const upgradeEl = document.getElementById('upgrade-' + upgradeType);
            
            if (upgrade.purchased) {
                button.textContent = 'OWNED';
                button.disabled = true;
                upgradeEl.classList.add('purchased');
            } else {
                button.disabled = this.money < upgrade.cost;
                button.textContent = this.money >= upgrade.cost ? 'BUY' : 'BUY';
            }
        });
    }
    
    /**
     * Main game loop - handles passive income and animations
     */
    gameLoop() {
        // Add passive income
        if (this.moneyPerSecond > 0) {
            this.money += this.moneyPerSecond / 10; // 10 times per second
            
            // Random floating coins for passive income
            if (Math.random() < 0.1) {
                this.createFloatingCoin();
            }
        }
        
        this.updateLevel();
        this.updateDisplay();
    }
    
    /**
     * Start the main game loop
     */
    startGameLoop() {
        this.gameLoop = setInterval(() => {
            this.gameLoop();
        }, 100); // Run 10 times per second
    }
    
    /**
     * Start auto-save
     */
    startAutoSave() {
        this.autoSaveInterval = setInterval(() => {
            this.saveGame();
        }, 30000); // Auto-save every 30 seconds
    }
    
    /**
     * Save game to localStorage
     */
    saveGame() {
        const gameData = {
            money: this.money,
            moneyPerSecond: this.moneyPerSecond,
            moneyPerClick: this.moneyPerClick,
            level: this.level,
            upgrades: this.upgrades
        };
        
        localStorage.setItem('beggarGameSave', JSON.stringify(gameData));
        this.showMessage('Game saved!');
    }
    
    /**
     * Load game from localStorage
     */
    loadGame() {
        const savedData = localStorage.getItem('beggarGameSave');
        
        if (savedData) {
            try {
                const gameData = JSON.parse(savedData);
                
                this.money = gameData.money || 0;
                this.moneyPerSecond = gameData.moneyPerSecond || 0;
                this.moneyPerClick = gameData.moneyPerClick || 1;
                this.level = gameData.level || 1;
                this.upgrades = gameData.upgrades || this.upgrades;
                
                // Apply visual upgrades
                if (this.upgrades.appearance.purchased) {
                    this.improveAppearance();
                }
                if (this.upgrades.dog.purchased) {
                    this.showDog();
                }
                if (this.upgrades.sign.purchased) {
                    this.addSign();
                }
                if (this.upgrades.cup.purchased) {
                    this.addCup();
                }
                
                this.showMessage('Game loaded!');
            } catch (error) {
                console.error('Error loading saved game:', error);
                this.showMessage('Error loading saved game!');
            }
        }
    }
    
    /**
     * Reset game to initial state
     */
    resetGame() {
        if (confirm('Are you sure you want to reset your progress? This cannot be undone!')) {
            localStorage.removeItem('beggarGameSave');
            location.reload();
        }
    }
    
    /**
     * Clean up when game is destroyed
     */
    destroy() {
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
        }
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
        }
    }
}

// Start the game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.beggarGame = new BeggarGame();
});

// Save game before page unload
window.addEventListener('beforeunload', () => {
    if (window.beggarGame) {
        window.beggarGame.saveGame();
    }
});

// Additional utility functions

/**
 * Format large numbers for display
 */
function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return Math.floor(num).toString();
}

/**
 * Random number between min and max
 */
function randomBetween(min, max) {
    return Math.random() * (max - min) + min;
}

/**
 * Create random color
 */
function randomColor() {
    const colors = ['#f39c12', '#e74c3c', '#27ae60', '#3498db', '#9b59b6'];
    return colors[Math.floor(Math.random() * colors.length)];
}
