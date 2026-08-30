```javascript
// ==========================================
// LIFE GAME
// APP.JS
// Главный файл приложения
// ==========================================

'use strict';


// ==========================================
// 1. CORE STATE
// ==========================================

let state = {
    finance: {
        monthlyIncome: 0,
        monthlyGoal: 100000,
        expenses: [],
        savings: 0
    },

    health: {
        health: 50,
        routine: 50,
        nutrition: 50,
        steps: 5000,
        workouts: 0,
        monthlyTarget: 12,
        level: 1
    },

    development: {
        books: 0,
        languageMinutes: 0,
        meditationMinutes: 0,
        xp: 0,
        level: 1,
        streak: 0
    },

    player: {
        xp: 0,
        level: 1
    }
};


// ==========================================
// 2. LOCAL STORAGE
// ==========================================

const STORAGE_KEY = 'life_game_data_v4';


function loadGameData() {

    try {

        const saved =
            localStorage.getItem(STORAGE_KEY);

        if (!saved) {
            return;
        }

        const data =
            JSON.parse(saved);

        if (data.finance) {

            state.finance = {
                ...state.finance,
                ...data.finance
            };

        }

        if (data.health) {

            state.health = {
                ...state.health,
                ...data.health
            };

        }

        if (data.development) {

            state.development = {
                ...state.development,
                ...data.development
            };

        }

        if (data.player) {

            state.player = {
                ...state.player,
                ...data.player
            };

        }

        console.log(
            '💾 LIFE GAME: данные загружены'
        );

    } catch (error) {

        console.error(
            'LIFE GAME: ошибка загрузки данных',
            error
        );

    }

}


function saveGameData() {

    try {

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(state)
        );

    } catch (error) {

        console.error(
            'LIFE GAME: ошибка сохранения',
            error
        );

    }

}


// ==========================================
// 3. HELPERS
// ==========================================

function clamp(
    value,
    min = 0,
    max = 100
) {

    return Math.min(
        max,
        Math.max(
            min,
            Number(value) || 0
        )
    );

}


function fmt(value) {

    return new Intl.NumberFormat(
        'ru-RU'
    ).format(
        Number(value) || 0
    );

}


function esc(value) {

    return String(value)
        .replace(
            /[&<>"']/g,
            character => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#039;'
            }[character])
        );

}


// ==========================================
// 4. FINANCE CALCULATIONS
// ==========================================

function getTotalExpenses() {

    return state.finance.expenses.reduce(
        (sum, expense) =>
            sum + (
                Number(expense.amount) || 0
            ),
        0
    );

}


function getExpensePercent() {

    const income =
        Number(
            state.finance.monthlyIncome
        ) || 0;

    if (income <= 0) {
        return 0;
    }

    return clamp(
        Math.round(
            getTotalExpenses() /
            income *
            100
        )
    );

}


function getSavingsPercent() {

    const income =
        Number(
            state.finance.monthlyIncome
        ) || 0;

    if (income <= 0) {
        return 0;
    }

    return clamp(
        Math.round(
            state.finance.savings /
            income *
            100
        )
    );

}


function getFinanceState() {

    const income =
        Number(
            state.finance.monthlyIncome
        ) || 0;

    const expenses =
        getTotalExpenses();

    const savings =
        Number(
            state.finance.savings
        ) || 0;

    if (income <= 0) {
        return 0;
    }

    /*
     * Финансовое состояние:
     *
     * 50% — способность зарабатывать
     * 25% — контроль обязательных расходов
     * 25% — финансовая подушка
     */

    const incomeScore =
        clamp(
            Math.round(
                income /
                Math.max(
                    1,
                    state.finance.monthlyGoal
                ) *
                100
            )
        );

    const expenseScore =
        clamp(
            100 -
            Math.round(
                expenses /
                income *
                100
            )
        );

    const savingsScore =
        clamp(
            Math.round(
                savings /
                income *
                100
            )
        );

    return clamp(
        Math.round(
            incomeScore * 0.5 +
            expenseScore * 0.25 +
            savingsScore * 0.25
        )
    );

}


// ==========================================
// 5. PLAYER XP
// ==========================================

function addXP(amount) {

    const value =
        Math.max(
            0,
            Number(amount) || 0
        );

    state.player.xp += value;

    while (
        state.player.xp >=
        state.player.level * 100
    ) {

        state.player.xp -=
            state.player.level * 100;

        state.player.level++;

        showToast(
            '🎉 УРОВЕНЬ ПОВЫШЕН! LVL ' +
            state.player.level
        );

    }

    saveGameData();
    updateAllUI();

}


// ==========================================
// 6. HOME UI
// ==========================================

function updateHealthUI() {

    const value =
        clamp(
            state.health.health
        );

    const percent =
        document.getElementById(
            'healthPercent'
        );

    const fill =
        document.getElementById(
            'healthFill'
        );

    if (percent) {
        percent.textContent =
            value + '%';
    }

    if (fill) {
        fill.style.width =
            value + '%';
    }

}


function updateFinanceUI() {

    const financeState =
        getFinanceState();

    const percent =
        document.getElementById(
            'financePercent'
        );

    const fill =
        document.getElementById(
            'financeFill'
        );

    if (percent) {

        percent.textContent =
            financeState + '%';

    }

    if (fill) {

        fill.style.width =
            financeState + '%';

    }

}


function updateDevelopmentUI() {

    const x =
        state.development;

    const books =
        clamp(
            Math.round(
                x.books / 2 * 100
            )
        );

    const language =
        clamp(
            Math.round(
                x.languageMinutes /
                30 *
                100
            )
        );

    const meditation =
        clamp(
            Math.round(
                x.meditationMinutes /
                15 *
                100
            )
        );

    const development =
        Math.round(
            (
                books +
                language +
                meditation
            ) / 3
        );

    const percent =
        document.getElementById(
            'developmentPercent'
        );

    const fill =
        document.getElementById(
            'developmentFill'
        );

    if (percent) {

        percent.textContent =
            development + '%';

    }

    if (fill) {

        fill.style.width =
            development + '%';

    }

}


function updateLevelUI() {

    const level =
        document.getElementById(
            'playerLevel'
        );

    const xp =
        document.getElementById(
            'playerXP'
        );

    const fill =
        document.getElementById(
            'playerXPFill'
        );

    const next =
        document.getElementById(
            'xpNext'
        );

    if (!level) {
        return;
    }

    const currentLevel =
        state.player.level;

    const currentXP =
        state.player.xp;

    const requiredXP =
        currentLevel * 100;

    level.textContent =
        'LVL ' + currentLevel;

    if (xp) {

        xp.textContent =
            currentXP + ' XP';

    }

    if (fill) {

        fill.style.width =
            Math.min(
                100,
                currentXP /
                requiredXP *
                100
            ) + '%';

    }

    if (next) {

        next.textContent =
            Math.max(
                0,
                requiredXP - currentXP
            ) +
            ' XP TO NEXT LEVEL';

    }

    const rank =
        document.getElementById(
            'playerRank'
        );

    if (rank) {

        const ranks = [
            'BEGINNER',
            'EXPLORER',
            'ADVENTURER',
            'HERO',
            'LEGEND'
        ];

        const index =
            Math.min(
                Math.floor(
                    currentLevel / 3
                ),
                ranks.length - 1
            );

        rank.textContent =
            ranks[index];

    }

}


function getDevelopmentProgress() {

    const x =
        state.development;

    const books =
        clamp(
            Math.round(
                x.books / 2 * 100
            )
        );

    const language =
        clamp(
            Math.round(
                x.languageMinutes /
                30 *
                100
            )
        );

    const meditation =
        clamp(
            Math.round(
                x.meditationMinutes /
                15 *
                100
            )
        );

    return Math.round(
        (
            books +
            language +
            meditation
        ) / 3
    );

}


function updateLifeProgressUI() {

    const healthProgress =
        clamp(
            state.health.health
        );

    const financeProgress =
        getFinanceState();

    const developmentProgress =
        getDevelopmentProgress();

    const progress =
        Math.round(
            (
                healthProgress +
                financeProgress +
                developmentProgress
            ) / 3
        );

    const lifeProgress =
        document.getElementById(
            'lifeProgress'
        );

    const lifeFill =
        document.getElementById(
            'lifeFill'
        );

    if (lifeProgress) {

        lifeProgress.innerHTML =
            progress +
            '<span>%</span>';

    }

    if (lifeFill) {

        lifeFill.style.width =
            progress + '%';

    }

}


// ==========================================
// 7. ALL UI
// ==========================================

function updateAllUI() {

    updateHealthUI();
    updateFinanceUI();
    updateDevelopmentUI();
    updateLevelUI();
    updateLifeProgressUI();

    /*
     * Если открыта страница финансов,
     * обновляем её содержимое через
     * finance.js.
     */

    if (
        currentPage === 'finance' &&
        window.LifeGameFinance &&
        typeof window.LifeGameFinance.refresh ===
        'function'
    ) {

        window.LifeGameFinance.refresh(
            state,
            getFinanceHelpers()
        );

    }

    saveGameData();

}


// ==========================================
// 8. FINANCE HELPERS
// ==========================================

function getFinanceHelpers() {

    return {

        fmt,
        clamp,
        esc,

        getTotalExpenses,
        getExpensePercent,
        getSavingsPercent,
        getFinanceState,

        save: saveGameData,

        toast: showToast,

        update: updateAllUI

    };

}


// ==========================================
// 9. HEALTH MECHANICS
// ==========================================

function increaseHealth() {

    const old =
        state.health.health;

    state.health.health =
        clamp(
            state.health.health + 5
        );

    if (
        state.health.health !== old
    ) {

        addXP(15);

        showToast(
            '❤️ +5 здоровья'
        );

    } else {

        showToast(
            '⚠️ Здоровье уже максимальное'
        );

    }

}


function decreaseHealth() {

    const old =
        state.health.health;

    state.health.health =
        Math.max(
            0,
            state.health.health - 5
        );

    if (
        state.health.health !== old
    ) {

        showToast(
            '💔 -5 здоровья'
        );

        updateAllUI();

    } else {

        showToast(
            '⚠️ Здоровье уже минимальное'
        );

    }

}


// ==========================================
// 10. DEVELOPMENT MECHANICS
// ==========================================

function levelUp() {

    const old =
        getDevelopmentProgress();

    if (old >= 100) {

        showToast(
            '⚠️ Развитие уже максимальное'
        );

        return;

    }

    state.development.meditationMinutes += 1;

    addXP(20);

    showToast(
        '🧠 +1 к развитию'
    );

}


// ==========================================
// 11. DAILY QUEST
// ==========================================

function completeDailyQuest() {

    const rewards = [

        {
            type: 'health',
            value: 10,
            text: '💪 +10 здоровья'
        },

        {
            type: 'income',
            value: 200,
            text: '💰 +200 ₽'
        },

        {
            type: 'development',
            value: 5,
            text: '🧠 +5 развития'
        }

    ];

    const reward =
        rewards[
            Math.floor(
                Math.random() *
                rewards.length
            )
        ];

    if (
        reward.type ===
        'health'
    ) {

        state.health.health =
            clamp(
                state.health.health +
                reward.value
            );

    }

    if (
        reward.type ===
        'income'
    ) {

        state.finance.monthlyIncome +=
            reward.value;

    }

    if (
        reward.type ===
        'development'
    ) {

        state.development.books +=
            reward.value;

    }

    addXP(50);

    showToast(
        '⚡ Квест выполнен! ' +
        reward.text
    );

    const button =
        document.getElementById(
            'dailyQuest'
        );

    if (button) {

        button.textContent =
            '✅ КВЕСТ ВЫПОЛНЕН';

        button.disabled =
            true;

        button.style.opacity =
            '0.5';

        setTimeout(
            () => {

                button.textContent =
                    '⚡ DAILY QUEST';

                button.disabled =
                    false;

                button.style.opacity =
                    '1';

            },
            30000
        );

    }

    updateAllUI();

}


// ==========================================
// 12. PAGE NAVIGATION
// ==========================================

let currentPage =
    'home';


const pageCreators = {

    home:
        createHomePage,

    finance:
        createFinancePage,

    health:
        createHealthPage,

    development:
        createDevelopmentPage

};


function setupNavigation() {

    const buttons =
        document.querySelectorAll(
            '.nav button'
        );

    buttons.forEach(
        button => {

            button.addEventListener(
                'click',
                function() {

                    const page =
                        this.dataset.nav;

                    if (
                        page &&
                        pageCreators[page]
                    ) {

                        openPage(page);

                    }

                }
            );

        }
    );

}


function openPage(pageName) {

    const oldPage =
        document.querySelector(
            '.page'
        );

    if (oldPage) {

        oldPage.remove();

    }

    document
        .querySelectorAll(
            '.nav button'
        )
        .forEach(
            button => {

                button.classList.toggle(
                    'active',
                    button.dataset.nav ===
                    pageName
                );

            }
        );

    const creator =
        pageCreators[pageName];

    if (!creator) {
        return;
    }

    const html =
        creator();

    const page =
        document.createElement(
            'div'
        );

    page.className =
        'page';

    page.innerHTML =
        html;

    document.body.appendChild(
        page
    );

    currentPage =
        pageName;

    document.body.classList.add(
        'locked'
    );


    /*
     * Передаём управление
     * специализированным модулям.
     */

    if (
        pageName === 'finance' &&
        window.LifeGameFinance &&
        typeof window.LifeGameFinance.init ===
        'function'
    ) {

        window.LifeGameFinance.init(
            state,
            getFinanceHelpers()
        );

    }

    if (
        pageName === 'health' &&
        window.LifeGameHealth &&
        typeof window.LifeGameHealth.init ===
        'function'
    ) {

        window.LifeGameHealth.init(
            state,
            getFinanceHelpers()
        );

    }

    if (
        pageName === 'development' &&
        window.LifeGameDevelopment &&
        typeof window.LifeGameDevelopment.init ===
        'function'
    ) {

        window.LifeGameDevelopment.init(
            state,
            getFinanceHelpers()
        );

    }

}


function closePage() {

    const page =
        document.querySelector(
            '.page'
        );

    if (page) {

        page.remove();

    }

    currentPage =
        'home';

    document.body.classList.remove(
        'locked'
    );

}


// ==========================================
// 13. HOME PAGE
// ==========================================

function createHomePage() {

    const health =
        clamp(
            state.health.health
        );

    const finance =
        getFinanceState();

    const development =
        getDevelopmentProgress();

    const total =
        Math.round(
            (
                health +
                finance +
                development
            ) / 3
        );

    return `

        <div class="page-inner">

            <div class="page-head">

                <button
                    class="back"
                    onclick="closePage()"
                >
                    ←
                </button>

                <h2>
                    Главная
                </h2>

            </div>


            <div class="summary">

                <div class="section-label">
                    ОБЩИЙ ПРОГРЕСС
                </div>

                <div
                    class="summary-number"
                    id="homeProgress"
                >
                    ${total}%
                </div>

                <div class="progress">

                    <i
                        id="homeProgressFill"
                        style="
                            width:${total}%
                        "
                    ></i>

                </div>

            </div>


            <div class="cards">

                <div class="metric">

                    <div class="metric-head">

                        <div class="metric-left">

                            <div class="metric-icon">
                                ❤️
                            </div>

                            <div class="metric-text">

                                <strong>
                                    Здоровье
                                </strong>

                                <span>
                                    ${health}%
                                </span>

                            </div>

                        </div>

                        <div class="metric-percent">
                            ${health}%
                        </div>

                    </div>

                    <div class="metric-bar">
                        <i
                            style="
                                width:${health}%
                            "
                        ></i>
                    </div>

                </div>


                <div class="metric">

                    <div class="metric-head">

                        <div class="metric-left">

                            <div class="metric-icon">
                                💰
                            </div>

                            <div class="metric-text">

                                <strong>
                                    Финансы
                                </strong>

                                <span>
                                    ${fmt(
                                        state.finance.monthlyIncome
                                    )} ₽
                                </span>

                            </div>

                        </div>

                        <div class="metric-percent">
                            ${finance}%
                        </div>

                    </div>

                    <div class="metric-bar">

                        <i
                            style="
                                width:${finance}%
                            "
                        ></i>

                    </div>

                </div>


                <div class="metric">

                    <div class="metric-head">

                        <div class="metric-left">

                            <div class="metric-icon">
                                🧠
                            </div>

                            <div class="metric-text">

                                <strong>
                                    Развитие
                                </strong>

                                <span>
                                    ${development}%
                                </span>

                            </div>

                        </div>

                        <div class="metric-percent">
                            ${development}%
                        </div>

                    </div>

                    <div class="metric-bar">

                        <i
                            style="
                                width:${development}%
                            "
                        ></i>

                    </div>

                </div>

            </div>

        </div>

    `;

}


// ==========================================
// 14. FINANCE PAGE
// ==========================================

function createFinancePage() {

    /*
     * ВАЖНО:
     *
     * Здесь больше НЕТ старого финансового
     * интерфейса.
     *
     * finance.js полностью отвечает
     * за содержимое страницы.
     */

    if (
        window.LifeGameFinance &&
        typeof window.LifeGameFinance.page ===
        'function'
    ) {

        return `

            <div class="page-inner">

                <div class="page-head">

                    <button
                        class="back"
                        onclick="closePage()"
                    >
                        ←
                    </button>

                    <h2>
                        Финансы
                    </h2>

                </div>

                <div id="financeModule">

                    ${window.LifeGameFinance.page(
                        state,
                        getFinanceHelpers()
                    )}

                </div>

            </div>

        `;

    }


    return `

        <div class="page-inner">

            <div class="page-head">

                <button
                    class="back"
                    onclick="closePage()"
                >
                    ←
                </button>

                <h2>
                    Финансы
                </h2>

            </div>

            <div class="notice">

                ⚠️ Модуль finance.js
                не загружен.

            </div>

        </div>

    `;

}


// ==========================================
// 15. HEALTH PAGE
// ==========================================

function createHealthPage() {

    if (
        window.LifeGameHealth &&
        typeof window.LifeGameHealth.page ===
        'function'
    ) {

        return `

            <div class="page-inner">

                <div class="page-head">

                    <button
                        class="back"
                        onclick="closePage()"
                    >
                        ←
                    </button>

                    <h2>
                        Здоровье
                    </h2>

                </div>

                ${window.LifeGameHealth.page(
                    state,
                    getFinanceHelpers()
                )}

            </div>

        `;

    }


    const health =
        clamp(
            state.health.health
        );

    return `

        <div class="page-inner">

            <div class="page-head">

                <button
                    class="back"
                    onclick="closePage()"
                >
                    ←
                </button>

                <h2>
                    Здоровье
                </h2>

            </div>

            <div class="summary">

                <div class="section-label">
                    ТЕКУЩЕЕ СОСТОЯНИЕ
                </div>

                <div class="summary-number">
                    ${health}%
                </div>

                <div class="progress">

                    <i
                        style="
                            width:${health}%
                        "
                    ></i>

                </div>

            </div>

        </div>

    `;

}


// ==========================================
// 16. DEVELOPMENT PAGE
// ==========================================

function createDevelopmentPage() {

    if (
        window.LifeGameDevelopment &&
        typeof window.LifeGameDevelopment.page ===
        'function'
    ) {

        return `

            <div class="page-inner">

                <div class="page-head">

                    <button
                        class="back"
                        onclick="closePage()"
                    >
                        ←
                    </button>

                    <h2>
                        Развитие
                    </h2>

                </div>

                ${window.LifeGameDevelopment.page(
                    state,
                    getFinanceHelpers()
                )}

            </div>

        `;

    }


    const development =
        getDevelopmentProgress();

    return `

        <div class="page-inner">

            <div class="page-head">

                <button
                    class="back"
                    onclick="closePage()"
                >
                    ←
                </button>

                <h2>
                    Развитие
                </h2>

            </div>

            <div class="summary">

                <div class="section-label">
                    УРОВЕНЬ РАЗВИТИЯ
                </div>

                <div class="summary-number">
                    ${development}%
                </div>

                <div class="progress">

                    <i
                        style="
                            width:${development}%
                        "
                    ></i>

                </div>

            </div>

        </div>

    `;

}


// ==========================================
// 17. GLOBAL EVENTS
// ==========================================

function setupEventListeners() {

    const quest =
        document.getElementById(
            'dailyQuest'
        );

    if (quest) {

        quest.addEventListener(
            'click',
            completeDailyQuest
        );

    }


    document.addEventListener(
        'click',
        function(event) {

            if (
                event.target.classList.contains(
                    'page'
                ) ||
                event.target.classList.contains(
                    'overlay'
                )
            ) {

                closePage();

            }

        }
    );


    document.addEventListener(
        'keydown',
        function(event) {

            if (
                event.key ===
                'Escape'
            ) {

                closePage();

            }

        }
    );

}


// ==========================================
// 18. TOAST
// ==========================================

function showToast(message) {

    const toast =
        document.createElement(
            'div'
        );

    toast.className =
        'toast show';

    toast.textContent =
        message;

    document.body.appendChild(
        toast
    );

    setTimeout(
        () => {

            toast.classList.remove(
                'show'
            );

            setTimeout(
                () => {

                    toast.remove();

                },
                300
            );

        },
        2500
    );

}


// ==========================================
// 19. GLOBAL API
// ==========================================

window.lifeGameState =
    state;

window.getLifeGameState =
    () => state;

window.saveGameData =
    saveGameData;

window.updateAllUI =
    updateAllUI;

window.updateFinanceUI =
    updateFinanceUI;

window.updateHealthUI =
    updateHealthUI;

window.updateDevelopmentUI =
    updateDevelopmentUI;

window.updateLifeProgressUI =
    updateLifeProgressUI;

window.addXP =
    addXP;

window.increaseHealth =
    increaseHealth;

window.decreaseHealth =
    decreaseHealth;

window.levelUp =
    levelUp;

window.completeDailyQuest =
    completeDailyQuest;

window.openPage =
    openPage;

window.closePage =
    closePage;

window.showToast =
    showToast;

window.getTotalExpenses =
    getTotalExpenses;

window.getExpensePercent =
    getExpensePercent;

window.getSavingsPercent =
    getSavingsPercent;

window.getFinanceState =
    getFinanceState;


// ==========================================
// 20. INITIALIZATION
// ==========================================

document.addEventListener(
    'DOMContentLoaded',
    function() {

        console.log(
            '🚀 LIFE GAME — APP START'
        );

        loadGameData();

        setupNavigation();

        setupEventListeners();

        updateAllUI();

        console.log(
            '✅ LIFE GAME — APP.JS READY'
        );

    }
);
```
