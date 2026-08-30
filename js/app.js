// ==========================================
// APP.JS - Главный файл управления приложением
// ==========================================

// ==========================================
// 1. ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ СОСТОЯНИЯ
// ==========================================

// Основные переменные (будут использоваться во всех модулях)
let health = 50;
let money = 1000;
let development = 30;
let level = 1;
let xp = 0;
let xpToNextLevel = 100;

// История доходов/расходов
let incomeHistory = [];
let expenseHistory = [];

// ==========================================
// 2. ИНИЦИАЛИЗАЦИЯ ПРИ ЗАГРУЗКЕ
// ==========================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 LIFE GAME 1.1 - Приложение запущено');
    
    // Загружаем сохраненные данные
    loadGameData();
    
    // Обновляем весь UI
    updateAllUI();
    
    // Настраиваем обработчики событий
    setupEventListeners();
    
    // Настраиваем навигацию
    setupNavigation();
});

// ==========================================
// 3. ЗАГРУЗКА / СОХРАНЕНИЕ ДАННЫХ
// ==========================================

function loadGameData() {
    const saved = localStorage.getItem('lifeGameData');
    if (saved) {
        try {
            const data = JSON.parse(saved);
            health = data.health || 50;
            money = data.money || 1000;
            development = data.development || 30;
            level = data.level || 1;
            xp = data.xp || 0;
            xpToNextLevel = data.xpToNextLevel || 100;
            incomeHistory = data.incomeHistory || [];
            expenseHistory = data.expenseHistory || [];
            console.log('💾 Данные загружены');
        } catch (e) {
            console.warn('Ошибка загрузки данных, используем значения по умолчанию');
        }
    }
}

function saveGameData() {
    const data = {
        health,
        money,
        development,
        level,
        xp,
        xpToNextLevel,
        incomeHistory,
        expenseHistory
    };
    localStorage.setItem('lifeGameData', JSON.stringify(data));
}

// ==========================================
// 4. ОБНОВЛЕНИЕ ВСЕГО UI
// ==========================================

function updateAllUI() {
    updateHealthUI();
    updateFinanceUI();
    updateDevelopmentUI();
    updateLevelUI();
    updateLifeProgressUI();
    saveGameData();
}

// Обновление интерфейса здоровья
function updateHealthUI() {
    const percent = Math.min(100, Math.max(0, health));
    document.getElementById('healthPercent').textContent = percent + '%';
    document.getElementById('healthFill').style.width = percent + '%';
    
    // Обновляем жизнь на главном экране
    updateLifeProgressUI();
}

// Обновление интерфейса финансов
function updateFinanceUI() {
    const percent = Math.min(100, Math.max(0, money / 20));
    document.getElementById('financePercent').textContent = Math.round(percent) + '%';
    document.getElementById('financeFill').style.width = Math.min(100, percent) + '%';
}

// Обновление интерфейса развития
function updateDevelopmentUI() {
    const percent = Math.min(100, Math.max(0, development));
    document.getElementById('developmentPercent').textContent = percent + '%';
    document.getElementById('developmentFill').style.width = percent + '%';
}

// Обновление уровня и XP
function updateLevelUI() {
    document.getElementById('playerLevel').textContent = 'LVL ' + level;
    document.getElementById('playerXP').textContent = xp + ' XP';
    
    const xpPercent = (xp / xpToNextLevel) * 100;
    document.getElementById('playerXPFill').style.width = Math.min(100, xpPercent) + '%';
    document.getElementById('xpNext').textContent = (xpToNextLevel - xp) + ' XP TO NEXT LEVEL';
    
    // Обновляем ранг
    const ranks = ['BEGINNER', 'EXPLORER', 'ADVENTURER', 'HERO', 'LEGEND'];
    const rankIndex = Math.min(Math.floor(level / 3), ranks.length - 1);
    document.getElementById('playerRank').textContent = ranks[rankIndex];
}

// Обновление общего прогресса жизни
function updateLifeProgressUI() {
    const avgProgress = (health + development + (money / 20)) / 3;
    const progress = Math.min(100, Math.round(avgProgress));
    document.getElementById('lifeProgress').innerHTML = progress + '<span>%</span>';
    document.getElementById('lifeFill').style.width = progress + '%';
}

// ==========================================
// 5. МЕХАНИКИ ИГРЫ
// ==========================================

// --- Механики Здоровья ---
function increaseHealth() {
    const oldHealth = health;
    health = Math.min(100, health + 5);
    if (health !== oldHealth) {
        addXP(15);
        showToast('❤️ +5 здоровья');
        updateAllUI();
    } else {
        showToast('⚠️ Здоровье уже максимальное');
    }
}

function decreaseHealth() {
    const oldHealth = health;
    health = Math.max(0, health - 5);
    if (health !== oldHealth) {
        showToast('💔 -5 здоровья');
        updateAllUI();
    } else {
        showToast('⚠️ Здоровье уже минимальное');
    }
}

// --- Механики Финансов ---
function addMoney() {
    const amount = 100;
    const oldMoney = money;
    money += amount;
    if (money !== oldMoney) {
        incomeHistory.push({ amount: amount, date: new Date().toLocaleString() });
        addXP(10);
        showToast('💰 +' + amount + ' монет');
        updateAllUI();
    }
}

function spendMoney() {
    const amount = 50;
    const oldMoney = money;
    money = Math.max(0, money - amount);
    if (money !== oldMoney) {
        expenseHistory.push({ amount: amount, date: new Date().toLocaleString() });
        showToast('💸 -' + amount + ' монет');
        updateAllUI();
    } else {
        showToast('⚠️ Недостаточно средств');
    }
}

// --- Механики Развития ---
function levelUp() {
    const oldDevelopment = development;
    development = Math.min(100, development + 3);
    if (development !== oldDevelopment) {
        addXP(20);
        showToast('🧠 +3 к развитию');
        updateAllUI();
    } else {
        showToast('⚠️ Развитие уже максимальное');
    }
}

// --- Система XP ---
function addXP(amount) {
    xp += amount;
    while (xp >= xpToNextLevel) {
        xp -= xpToNextLevel;
        level++;
        xpToNextLevel = Math.floor(xpToNextLevel * 1.5) + 10;
        showToast('🎉 УРОВЕНЬ ПОВЫШЕН! Уровень ' + level);
    }
    updateAllUI();
}

// ==========================================
// 6. ЕЖЕДНЕВНЫЙ КВЕСТ
// ==========================================

function completeDailyQuest() {
    const rewards = [
        { health: 10, text: '💪 +10 здоровья' },
        { money: 200, text: '💰 +200 монет' },
        { development: 5, text: '🧠 +5 развития' }
    ];
    
    const reward = rewards[Math.floor(Math.random() * rewards.length)];
    
    if (reward.health) {
        health = Math.min(100, health + reward.health);
    } else if (reward.money) {
        money += reward.money;
    } else if (reward.development) {
        development = Math.min(100, development + reward.development);
    }
    
    addXP(50);
    showToast('⚡ Квест выполнен! ' + reward.text);
    updateAllUI();
    document.getElementById('dailyQuest').textContent = '✅ КВЕСТ ВЫПОЛНЕН';
    document.getElementById('dailyQuest').disabled = true;
    document.getElementById('dailyQuest').style.opacity = '0.5';
    
    // Возвращаем квест через 30 секунд
    setTimeout(() => {
        document.getElementById('dailyQuest').textContent = '⚡ DAILY QUEST';
        document.getElementById('dailyQuest').disabled = false;
        document.getElementById('dailyQuest').style.opacity = '1';
    }, 30000);
}

// ==========================================
// 7. НАВИГАЦИЯ
// ==========================================

let currentPage = 'home';

function setupNavigation() {
    const navButtons = document.querySelectorAll('.nav button');
    const pages = {
        home: createHomePage,
        finance: createFinancePage,
        health: createHealthPage,
        development: createDevelopmentPage
    };
    
    navButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const page = this.dataset.nav;
            if (page && pages[page]) {
                openPage(page);
            }
        });
    });
}

function openPage(pageName) {
    // Убираем старую страницу
    const oldPage = document.querySelector('.page');
    if (oldPage) {
        oldPage.remove();
    }
    
    // Обновляем активную кнопку
    document.querySelectorAll('.nav button').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.nav === pageName);
    });
    
    // Создаем новую страницу
    const pageCreators = {
        home: createHomePage,
        finance: createFinancePage,
        health: createHealthPage,
        development: createDevelopmentPage
    };
    
    if (pageCreators[pageName]) {
        const pageHTML = pageCreators[pageName]();
        const pageDiv = document.createElement('div');
        pageDiv.className = 'page';
        pageDiv.innerHTML = pageHTML;
        document.body.appendChild(pageDiv);
        
        // Настраиваем обработчики для новой страницы
        setupPageHandlers(pageName);
    }
    
    currentPage = pageName;
    document.body.classList.add('locked');
}

function closePage() {
    const page = document.querySelector('.page');
    if (page) {
        page.remove();
    }
    document.body.classList.remove('locked');
}

// --- Создание страниц ---
function createHomePage() {
    return `
        <div class="page-inner">
            <div class="page-head">
                <button class="back" onclick="closePage()">←</button>
                <h2>Главная</h2>
            </div>
            
            <div class="summary">
                <div class="section-label">ОБЩИЙ ПРОГРЕСС</div>
                <div class="summary-number" id="homeProgress">${Math.round((health + development + (money / 20)) / 3)}%</div>
                <div class="progress">
                    <i id="homeProgressFill" style="width: ${Math.round((health + development + (money / 20)) / 3)}%"></i>
                </div>
            </div>
            
            <div class="cards">
                <div class="metric">
                    <div class="metric-head">
                        <div class="metric-left">
                            <div class="metric-icon">❤️</div>
                            <div class="metric-text">
                                <strong>Здоровье</strong>
                                <span>${Math.round(health)}%</span>
                            </div>
                        </div>
                        <div class="metric-percent">${Math.round(health)}%</div>
                    </div>
                    <div class="metric-bar">
                        <i style="width: ${Math.round(health)}%"></i>
                    </div>
                </div>
                
                <div class="metric">
                    <div class="metric-head">
                        <div class="metric-left">
                            <div class="metric-icon">💰</div>
                            <div class="metric-text">
                                <strong>Финансы</strong>
                                <span>${money} монет</span>
                            </div>
                        </div>
                        <div class="metric-percent">${Math.round(money / 20)}%</div>
                    </div>
                    <div class="metric-bar">
                        <i style="width: ${Math.min(100, Math.round(money / 20))}%"></i>
                    </div>
                </div>
                
                <div class="metric">
                    <div class="metric-head">
                        <div class="metric-left">
                            <div class="metric-icon">🧠</div>
                            <div class="metric-text">
                                <strong>Развитие</strong>
                                <span>${Math.round(development)}%</span>
                            </div>
                        </div>
                        <div class="metric-percent">${Math.round(development)}%</div>
                    </div>
                    <div class="metric-bar">
                        <i style="width: ${Math.round(development)}%"></i>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function createFinancePage() {
    return `
        <div class="page-inner">
            <div class="page-head">
                <button class="back" onclick="closePage()">←</button>
                <h2>Финансы</h2>
            </div>
            
            <div class="summary">
                <div class="section-label">БАЛАНС</div>
                <div class="summary-number">${money} ₽</div>
                <div class="finance-box">
                    <div class="finance-line">
                        <span>ДОХОДЫ</span>
                        <strong style="color: #4CAF50;">+${incomeHistory.reduce((sum, i) => sum + i.amount, 0)} ₽</strong>
                    </div>
                    <div class="finance-line">
                        <span>РАСХОДЫ</span>
                        <strong style="color: #ff6b6b;">-${expenseHistory.reduce((sum, i) => sum + i.amount, 0)} ₽</strong>
                    </div>
                </div>
            </div>
            
            <div style="display: flex; gap: 10px; margin-bottom: 15px;">
                <button class="edit" onclick="addMoney()">💵 ПОЛУЧИТЬ ДОХОД</button>
                <button class="edit" onclick="spendMoney()">💳 СОВЕРШИТЬ РАСХОД</button>
            </div>
            
            <div class="notice">
                💡 Совет: Увеличивайте доходы и контролируйте расходы для финансового роста!
            </div>
        </div>
    `;
}

function createHealthPage() {
    return `
        <div class="page-inner">
            <div class="page-head">
                <button class="back" onclick="closePage()">←</button>
                <h2>Здоровье</h2>
            </div>
            
            <div class="summary">
                <div class="section-label">ТЕКУЩЕЕ СОСТОЯНИЕ</div>
                <div class="summary-number" style="color: ${health > 60 ? '#4CAF50' : health > 30 ? '#FFA726' : '#ff6b6b'}">${Math.round(health)}%</div>
                <div class="progress">
                    <i style="width: ${Math.round(health)}%; background: ${health > 60 ? '#4CAF50' : health > 30 ? '#FFA726' : '#ff6b6b'}"></i>
                </div>
            </div>
            
            <div style="display: flex; gap: 10px; margin-bottom: 15px;">
                <button class="edit" onclick="increaseHealth()">❤️ УЛУЧШИТЬ ЗДОРОВЬЕ</button>
                <button class="edit" onclick="decreaseHealth()">💔 УХУДШИТЬ ЗДОРОВЬЕ</button>
            </div>
            
            <div class="notice">
                🏃 Рекомендация: Регулярные тренировки и правильное питание улучшают здоровье!
            </div>
        </div>
    `;
}

function createDevelopmentPage() {
    return `
        <div class="page-inner">
            <div class="page-head">
                <button class="back" onclick="closePage()">←</button>
                <h2>Развитие</h2>
            </div>
            
            <div class="summary">
                <div class="section-label">УРОВЕНЬ РАЗВИТИЯ</div>
                <div class="summary-number">${Math.round(development)}%</div>
                <div class="progress">
                    <i style="width: ${Math.round(development)}%"></i>
                </div>
                <div class="finance-box">
                    <div class="finance-line">
                        <span>УРОВЕНЬ</span>
                        <strong>${level}</strong>
                    </div>
                    <div class="finance-line">
                        <span>ОПЫТ</span>
                        <strong>${xp} / ${xpToNextLevel} XP</strong>
                    </div>
                </div>
            </div>
            
            <button class="edit" onclick="levelUp()" style="margin-bottom: 15px;">🧠 ПОВЫСИТЬ УРОВЕНЬ РАЗВИТИЯ</button>
            
            <div class="notice">
                📚 Читайте книги, изучайте новое и развивайте навыки для роста!
            </div>
        </div>
    `;
}

function setupPageHandlers(pageName) {
    // Можно добавить специфичные обработчики для каждой страницы
    console.log('Страница открыта:', pageName);
}

// ==========================================
// 8. ОБЩИЕ ОБРАБОТЧИКИ СОБЫТИЙ
// ==========================================

function setupEventListeners() {
    // Daily Quest
    const questBtn = document.getElementById('dailyQuest');
    if (questBtn) {
        questBtn.addEventListener('click', completeDailyQuest);
    }
    
    // Закрытие страниц по клику вне модалки
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('page') || e.target.classList.contains('overlay')) {
            closePage();
        }
    });
    
    // Обработка нажатия Esc для закрытия
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closePage();
        }
    });
}

// ==========================================
// 9. ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ==========================================

function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast show';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 2500);
}

// ==========================================
// 10. ЭКСПОРТ ФУНКЦИЙ ДЛЯ ДРУГИХ МОДУЛЕЙ
// ==========================================

// Делаем функции доступными глобально для использования в других скриптах
window.increaseHealth = increaseHealth;
window.decreaseHealth = decreaseHealth;
window.addMoney = addMoney;
window.spendMoney = spendMoney;
window.levelUp = levelUp;
window.completeDailyQuest = completeDailyQuest;
window.closePage = closePage;
window.updateAllUI = updateAllUI;
window.showToast = showToast;

console.log('✅ APP.JS загружен успешно');
