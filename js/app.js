```javascript
// ============================================================
// LIFE GAME
// APP.JS
// Главный контроллер приложения
// Новая архитектура
// ============================================================

'use strict';


// ============================================================
// IMPORTS
// ============================================================

import {
    createDefaultState
} from './state.js';

import {
    loadState,
    loadExpenses,
    loadUI,
    saveState,
    saveExpenses,
    saveUI
} from './storage.js';

import {
    clamp,
    fmt,
    esc,
    percent
} from './utilities.js';

import {
    xpForLevel,
    levelFromXP,
    playerXPFromCategoryXP,
    xpWithStreak
} from './xp.js';


// ============================================================
// GLOBAL APP STATE
// ============================================================

let state = null;
let expenses = [];
let ui = {};

let currentPage = 'home';


// ============================================================
// NORMALIZE STATE
// ============================================================

function normalizeState(data) {

    const defaults =
        createDefaultState();

    const source =
        data && typeof data === 'object'
            ? data
            : {};

    const result =
        JSON.parse(
            JSON.stringify(defaults)
        );


    // --------------------------------------------------------
    // PLAYER
    // --------------------------------------------------------

    if (source.player) {

        Object.assign(
            result.player,
            source.player
        );

    }


    // --------------------------------------------------------
    // CATEGORIES
    // --------------------------------------------------------

    if (source.categories) {

        Object.keys(
            result.categories
        ).forEach(category => {

            if (
                source.categories[category]
            ) {

                Object.assign(
                    result.categories[category],
                    source.categories[category]
                );

            }

        });

    }


    // --------------------------------------------------------
    // SIMULATOR
    // --------------------------------------------------------

    if (source.simulator) {

        Object.assign(
            result.simulator,
            source.simulator
        );

    }


    // --------------------------------------------------------
    // QUESTS
    // --------------------------------------------------------

    if (Array.isArray(source.quests)) {

        result.quests =
            source.quests;

    }


    // --------------------------------------------------------
    // SAFE NUMBERS
    // --------------------------------------------------------

    result.player.xp =
        Math.max(
            0,
            Number(result.player.xp) || 0
        );

    result.player.level =
        Math.max(
            1,
            Number(result.player.level) || 1
        );


    Object.keys(
        result.categories
    ).forEach(category => {

        const item =
            result.categories[category];

        item.xp =
            Math.max(
                0,
                Number(item.xp) || 0
            );

        item.level =
            Math.max(
                1,
                Number(item.level) || 1
            );

        item.streak =
            Math.max(
                0,
                Number(item.streak) || 0
            );

        item.bestStreak =
            Math.max(
                0,
                Number(item.bestStreak) || 0
            );

    });


    return result;

}


// ============================================================
// LOAD
// ============================================================

function loadGame() {

    state =
        loadState(
            normalizeState
        );

    expenses =
        loadExpenses();

    ui =
        loadUI();


    if (!state) {

        state =
            createDefaultState();

    }


    state =
        normalizeState(state);


    console.log(
        'LIFE GAME: state loaded',
        state
    );

}


// ============================================================
// SAVE
// ============================================================

function saveGame() {

    if (!state) {
        return;
    }

    saveState(state);
    saveExpenses(expenses);
    saveUI(ui);

}


// ============================================================
// TOAST
// ============================================================

function showToast(message) {

    let toast =
        document.querySelector('.toast');

    if (!toast) {

        toast =
            document.createElement('div');

        toast.className =
            'toast';

        document.body.appendChild(
            toast
        );

    }

    toast.textContent =
        message;

    toast.classList.add(
        'show'
    );


    clearTimeout(
        toast._timer
    );


    toast._timer =
        setTimeout(() => {

            toast.classList.remove(
                'show'
            );

        }, 2500);

}


// ============================================================
// PLAYER XP
// ============================================================

function addPlayerXP(amount) {

    amount =
        Math.max(
            0,
            Number(amount) || 0
        );

    if (!amount) {
        return;
    }


    state.player.xp +=
        amount;


    while (
        state.player.xp >=
        xpForLevel(
            state.player.level + 1
        )
    ) {

        state.player.xp -=
            xpForLevel(
                state.player.level + 1
            );

        state.player.level++;


        showToast(
            '🎉 УРОВЕНЬ ПОВЫШЕН! LVL ' +
            state.player.level
        );

    }


    saveGame();

    updateAllUI();

}


// ============================================================
// CATEGORY XP
// ============================================================

function addCategoryXP(
    category,
    amount
) {

    if (
        !state.categories[category]
    ) {

        return;

    }


    amount =
        Math.max(
            0,
            Number(amount) || 0
        );


    if (!amount) {
        return;
    }


    const item =
        state.categories[category];


    item.xp +=
        amount;


    item.level =
        levelFromXP(
            item.xp
        );


    const playerXP =
        playerXPFromCategoryXP(
            amount
        );


    if (playerXP > 0) {

        addPlayerXP(
            playerXP
        );

    } else {

        saveGame();
        updateAllUI();

    }

}


// ============================================================
// CATEGORY PROGRESS
// ============================================================

function financeProgress() {

    const finance =
        state.categories.finance;


    const income =
        Math.max(
            0,
            Number(
                finance.monthlyIncome
            ) || 0
        );


    if (!income) {
        return 0;
    }


    const spent =
        expenses.reduce(
            (sum, item) =>
                sum +
                Math.max(
                    0,
                    Number(item.amount) || 0
                ),
            0
        );


    const savings =
        Math.max(
            0,
            Number(finance.savings) || 0
        );


    const expensePercent =
        Math.min(
            100,
            spent / income * 100
        );


    const savingsPercent =
        Math.min(
            100,
            savings / income * 100
        );


    const financialScore =
        Math.max(
            0,
            Math.min(
                100,
                100 -
                expensePercent +
                savingsPercent
            )
        );


    return Math.round(
        financialScore
    );

}


function healthProgress() {

    const x =
        state.categories.health;


    const routine =
        clamp(
            x.routine,
            0,
            100
        );


    const nutrition =
        clamp(
            x.nutrition,
            0,
            100
        );


    const steps =
        percent(
            x.steps,
            10000
        );


    const training =
        percent(
            state.categories.training.workouts,
            state.categories.training.monthlyTarget
        );


    return Math.round(
        (
            routine +
            nutrition +
            steps +
            training
        ) / 4
    );

}


function developmentProgress() {

    const x =
        state.categories.development;


    const books =
        percent(
            x.books,
            2
        );


    const language =
        percent(
            x.languageMinutes,
            30
        );


    const meditation =
        percent(
            x.meditationMinutes,
            15
        );


    return Math.round(
        (
            books +
            language +
            meditation
        ) / 3
    );

}


// ============================================================
// LIFE PROGRESS
// ============================================================

function lifeProgress() {

    const finance =
        financeProgress();

    const health =
        healthProgress();

    const development =
        developmentProgress();


    return Math.round(
        (
            finance +
            health +
            development
        ) / 3
    );

}


// ============================================================
// RANK
// ============================================================

function getRank(level) {

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
                Math.max(
                    1,
                    level
                ) / 3
            ),
            ranks.length - 1
        );


    return ranks[index];

}


// ============================================================
// HOME UI
// ============================================================

function updateHomeUI() {

    if (!state) {
        return;
    }


    const player =
        state.player;


    const playerLevel =
        document.getElementById(
            'playerLevel'
        );


    const playerXP =
        document.getElementById(
            'playerXP'
        );


    const playerXPFill =
        document.getElementById(
            'playerXPFill'
        );


    const xpNext =
        document.getElementById(
            'xpNext'
        );


    const playerRank =
        document.getElementById(
            'playerRank'
        );


    if (playerLevel) {

        playerLevel.textContent =
            'LVL ' +
            player.level;

    }


    if (playerXP) {

        playerXP.textContent =
            fmt(player.xp) +
            ' XP';

    }


    const nextXP =
        xpForLevel(
            player.level + 1
        );


    const xpPercent =
        clamp(
            player.xp /
            nextXP *
            100,
            0,
            100
        );


    if (playerXPFill) {

        playerXPFill.style.width =
            xpPercent + '%';

    }


    if (xpNext) {

        xpNext.textContent =
            fmt(
                Math.max(
                    0,
                    nextXP -
                    player.xp
                )
            ) +
            ' XP TO NEXT LEVEL';

    }


    if (playerRank) {

        playerRank.textContent =
            getRank(
                player.level
            );

    }


    const progress =
        lifeProgress();


    const lifeProgressEl =
        document.getElementById(
            'lifeProgress'
        );


    const lifeFill =
        document.getElementById(
            'lifeFill'
        );


    if (lifeProgressEl) {

        lifeProgressEl.innerHTML =
            progress +
            '<span>%</span>';

    }


    if (lifeFill) {

        lifeFill.style.width =
            progress + '%';

    }


    const finance =
        financeProgress();


    const financePercent =
        document.getElementById(
            'financePercent'
        );


    const financeFill =
        document.getElementById(
            'financeFill'
        );


    if (financePercent) {

        financePercent.textContent =
            finance + '%';

    }


    if (financeFill) {

        financeFill.style.width =
            finance + '%';

    }


    const development =
        developmentProgress();


    const developmentPercent =
        document.getElementById(
            'developmentPercent'
        );


    const developmentFill =
        document.getElementById(
            'developmentFill'
        );


    if (developmentPercent) {

        developmentPercent.textContent =
            development + '%';

    }


    if (developmentFill) {

        developmentFill.style.width =
            development + '%';

    }


    const health =
        healthProgress();


    const healthPercent =
        document.getElementById(
            'healthPercent'
        );


    const healthFill =
        document.getElementById(
            'healthFill'
        );


    if (healthPercent) {

        healthPercent.textContent =
            health + '%';

    }


    if (healthFill) {

        healthFill.style.width =
            health + '%';

    }

}


// ============================================================
// UPDATE ALL UI
// ============================================================

function updateAllUI() {

    updateHomeUI();


    if (
        currentPage === 'finance'
    ) {

        renderFinancePage();

    }


    if (
        currentPage === 'health'
    ) {

        renderHealthPage();

    }


    if (
        currentPage === 'development'
    ) {

        renderDevelopmentPage();

    }

}


// ============================================================
// PAGE SHELL
// ============================================================

function pageShell(
    title,
    content
) {

    return `

        <div class="page-inner">

            <div class="page-head">

                <button
                    class="back"
                    type="button"
                    data-action="close-page"
                >
                    ←
                </button>

                <h2>
                    ${esc(title)}
                </h2>

            </div>

            ${content}

        </div>

    `;

}


// ============================================================
// FINANCE PAGE
// ============================================================

function renderFinancePage() {

    const page =
        document.querySelector(
            '.page'
        );


    if (!page) {
        return;
    }


    const x =
        state.categories.finance;


    const income =
        Math.max(
            0,
            Number(x.monthlyIncome) || 0
        );


    const goal =
        Math.max(
            0,
            Number(x.monthlyGoal) || 0
        );


    const savings =
        Math.max(
            0,
            Number(x.savings) || 0
        );


    const totalExpenses =
        expenses.reduce(
            (sum, item) =>
                sum +
                Math.max(
                    0,
                    Number(item.amount) || 0
                ),
            0
        );


    const expensePercent =
        income > 0
            ? Math.min(
                100,
                Math.round(
                    totalExpenses /
                    income *
                    100
                )
            )
            : 0;


    const savingsPercent =
        income > 0
            ? Math.min(
                100,
                Math.round(
                    savings /
                    income *
                    100
                )
            )
            : 0;


    const goalPercent =
        goal > 0
            ? Math.min(
                100,
                Math.round(
                    income /
                    goal *
                    100
                )
            )
            : 0;


    const balance =
        income -
        totalExpenses;


    const financialState =
        financeProgress();


    page.innerHTML =
        pageShell(
            'Финансы',

            `

            <div class="summary">

                <div class="section-label">
                    ФИНАНСОВОЕ СОСТОЯНИЕ
                </div>

                <div class="summary-number">
                    ${financialState}%
                </div>

                <div class="progress">

                    <i
                        style="width:${financialState}%"
                    ></i>

                </div>

                <div class="finance-box">

                    <div class="finance-line">

                        <span>
                            ЗАРАБОТАНО ЗА МЕСЯЦ
                        </span>

                        <strong>
                            ${fmt(income)} ₽
                        </strong>

                    </div>

                    <div class="finance-line">

                        <span>
                            РАСХОДЫ
                        </span>

                        <strong>
                            ${fmt(totalExpenses)} ₽
                            · ${expensePercent}%
                        </strong>

                    </div>

                    <div class="finance-line">

                        <span>
                            ФИНАНСОВАЯ ПОДУШКА
                        </span>

                        <strong>
                            ${fmt(savings)} ₽
                            · ${savingsPercent}%
                        </strong>

                    </div>

                </div>

            </div>


            <div class="cards">


                <div class="metric">

                    <div class="metric-head">

                        <div class="metric-left">

                            <div class="metric-icon">
                                💵
                            </div>

                            <div class="metric-text">

                                <strong>
                                    Заработано за месяц
                                </strong>

                                <span>
                                    ${fmt(income)} ₽
                                </span>

                            </div>

                        </div>

                        <div class="metric-percent">
                            ${goalPercent}%
                        </div>

                    </div>

                    <div class="metric-bar">

                        <i
                            style="width:${goalPercent}%"
                        ></i>

                    </div>

                    <button
                        class="edit"
                        type="button"
                        data-action="edit-income"
                    >
                        ИЗМЕНИТЬ ДОХОД
                    </button>

                </div>


                <div class="metric">

                    <div class="metric-head">

                        <div class="metric-left">

                            <div class="metric-icon">
                                🎯
                            </div>

                            <div class="metric-text">

                                <strong>
                                    Цель за месяц
                                </strong>

                                <span>
                                    ${fmt(goal)} ₽
                                </span>

                            </div>

                        </div>

                        <div class="metric-percent">
                            ${goalPercent}%
                        </div>

                    </div>

                    <div class="metric-bar">

                        <i
                            style="width:${goalPercent}%"
                        ></i>

                    </div>

                    <button
                        class="edit"
                        type="button"
                        data-action="edit-goal"
                    >
                        ИЗМЕНИТЬ ЦЕЛЬ
                    </button>

                </div>


                <div
                    class="metric expenses ${
                        ui.expensesCollapsed
                            ? 'collapsed'
                            : ''
                    }"
                >

                    <button
                        class="expenses-title"
                        type="button"
                        data-action="toggle-expenses"
                    >

                        <div class="expenses-title-left">

                            <span>
                                💳
                            </span>

                            <span>
                                ОБЯЗАТЕЛЬНЫЕ РАСХОДЫ
                            </span>

                            <strong>
                                ${fmt(totalExpenses)} ₽
                            </strong>

                        </div>

                    </button>


                    <div class="expense-content">

                        <div class="expense-list">

                            ${
                                expenses.length
                                    ? expenses.map(
                                        createExpenseHTML
                                    ).join('')
                                    : `
                                    <div class="notice">
                                        Пока обязательных расходов нет.
                                    </div>
                                    `
                            }

                        </div>


                        <button
                            class="add"
                            type="button"
                            data-action="add-expense"
                            style="margin-top:9px"
                        >
                            + ДОБАВИТЬ РАСХОД
                        </button>


                        <div class="ratio">

                            <span>
                                РАСХОДЫ ОТ ДОХОДА
                            </span>

                            <strong>
                                ${expensePercent}%
                            </strong>

                        </div>

                    </div>

                </div>


                <div class="metric">

                    <div class="metric-head">

                        <div class="metric-left">

                            <div class="metric-icon">
                                🛡️
                            </div>

                            <div class="metric-text">

                                <strong>
                                    Финансовая подушка
                                </strong>

                                <span>
                                    ${fmt(savings)} ₽
                                    · ${savingsPercent}% от дохода
                                </span>

                            </div>

                        </div>

                        <div class="metric-percent">
                            ${savingsPercent}%
                        </div>

                    </div>

                    <div class="metric-bar">

                        <i
                            style="width:${savingsPercent}%"
                        ></i>

                    </div>

                    <button
                        class="edit"
                        type="button"
                        data-action="edit-savings"
                    >
                        ИЗМЕНИТЬ НАКОПЛЕНИЯ
                    </button>

                </div>


                <div class="summary">

                    <div class="section-label">
                        ФИНАНСОВОЕ СОСТОЯНИЕ
                    </div>

                    <div class="summary-number">
                        ${financialState}%
                    </div>

                    <div class="progress">

                        <i
                            style="width:${financialState}%"
                        ></i>

                    </div>

                    <div class="finance-box">

                        <div class="finance-line">

                            <span>
                                ДОХОД
                            </span>

                            <strong>
                                ${fmt(income)} ₽
                            </strong>

                        </div>

                        <div class="finance-line">

                            <span>
                                ОБЯЗАТЕЛЬНЫЕ РАСХОДЫ
                            </span>

                            <strong>
                                -${fmt(totalExpenses)} ₽
                            </strong>

                        </div>

                        <div class="finance-line">

                            <span>
                                ОСТАЛОСЬ
                            </span>

                            <strong>
                                ${fmt(balance)} ₽
                            </strong>

                        </div>

                    </div>

                </div>


                <div class="notice">

                    Чем выше доход,
                    ниже обязательные расходы
                    и больше накопления —
                    тем выше финансовое состояние.

                </div>

            </div>

            `

        );

}


// ============================================================
// EXPENSE HTML
// ============================================================

function createExpenseHTML(
    expense
) {

    return `

        <div
            class="expense-swipe"
            data-expense-id="${esc(expense.id)}"
        >

            <div
                class="expense-delete-reveal"
            ></div>

            <div
                class="expense"
                data-expense-id="${esc(expense.id)}"
            >

                <div class="expense-info">

                    <div class="expense-name">
                        ${esc(expense.name)}
                    </div>

                    <div class="expense-amount">
                        ${fmt(expense.amount)} ₽
                    </div>

                </div>

            </div>

        </div>

    `;

}


// ============================================================
// HEALTH PAGE
// ============================================================

function renderHealthPage() {

    const page =
        document.querySelector(
            '.page'
        );


    if (!page) {
        return;
    }


    const x =
        state.categories.health;


    const routine =
        clamp(
            x.routine,
            0,
            100
        );


    const nutrition =
        clamp(
            x.nutrition,
            0,
            100
        );


    const steps =
        percent(
            x.steps,
            10000
        );


    const training =
        state.categories.training;


    const workouts =
        Math.max(
            0,
            Number(training.workouts) || 0
        );


    const target =
        Math.max(
            1,
            Number(training.monthlyTarget) || 12
        );


    const workoutPercent =
        percent(
            workouts,
            target
        );


    const health =
        healthProgress();


    page.innerHTML =
        pageShell(
            'Здоровье',

            `

            <div class="summary">

                <div class="section-label">
                    HEALTH LEVEL
                </div>

                <div class="summary-number">
                    ${health}%
                </div>

                <div class="progress">

                    <i
                        style="width:${health}%"
                    ></i>

                </div>

            </div>


            <div class="cards">


                ${healthMetric(
                    '⏰',
                    'Режим дня',
                    routine,
                    'routine'
                )}


                ${healthMetric(
                    '🍎',
                    'Питание',
                    nutrition,
                    'nutrition'
                )}


                ${healthMetric(
                    '🚶',
                    'Шаги',
                    steps,
                    'steps',
                    fmt(x.steps) +
                    ' шагов / 10 000 шагов'
                )}


                ${healthMetric(
                    '🏋️',
                    'Тренировки',
                    workoutPercent,
                    'workout',
                    workouts +
                    ' из ' +
                    target +
                    ' за месяц'
                )}


                <div class="notice">

                    Прогресс здоровья считается
                    автоматически на основе режима,
                    питания, шагов и тренировок.

                </div>

            </div>

            `

        );

}


function healthMetric(
    icon,
    title,
    value,
    action,
    text
) {

    return `

        <div class="metric">

            <div class="metric-head">

                <div class="metric-left">

                    <div class="metric-icon">
                        ${icon}
                    </div>

                    <div class="metric-text">

                        <strong>
                            ${title}
                        </strong>

                        <span>
                            ${
                                text ||
                                value + '% / 100%'
                            }
                        </span>

                    </div>

                </div>

                <div class="metric-percent">
                    ${value}%
                </div>

            </div>

            <div class="metric-bar">

                <i
                    style="width:${clamp(
                        value,
                        0,
                        100
                    )}%"
                ></i>

            </div>

            <button
                class="edit"
                type="button"
                data-health-action="${action}"
            >
                ИЗМЕНИТЬ
            </button>

        </div>

    `;

}


// ============================================================
// DEVELOPMENT PAGE
// ============================================================

function renderDevelopmentPage() {

    const page =
        document.querySelector(
            '.page'
        );


    if (!page) {
        return;
    }


    const x =
        state.categories.development;


    const books =
        percent(
            x.books,
            2
        );


    const language =
        percent(
            x.languageMinutes,
            30
        );


    const meditation =
        percent(
            x.meditationMinutes,
            15
        );


    const progress =
        developmentProgress();


    page.innerHTML =
        pageShell(
            'Развитие',

            `

            <div class="summary">

                <div class="section-label">
                    DEVELOPMENT LEVEL
                    ${x.level}
                </div>

                <div class="summary-number">
                    ${progress}%
                </div>

                <div class="progress">

                    <i
                        style="width:${progress}%"
                    ></i>

                </div>

                <div class="finance-box">

                    <div class="finance-line">

                        <span>
                            DEVELOPMENT XP
                        </span>

                        <strong>
                            ${fmt(x.xp)} XP
                        </strong>

                    </div>

                    <div class="finance-line">

                        <span>
                            STREAK
                        </span>

                        <strong>
                            🔥 ${x.streak}
                        </strong>

                    </div>

                </div>

            </div>


            <div class="cards">


                ${developmentMetric(
                    '📚',
                    'Чтение книг',
                    x.books,
                    2,
                    'books'
                )}


                ${developmentMetric(
                    '🌐',
                    'Изучение языка',
                    x.languageMinutes,
                    30,
                    'languageMinutes',
                    ' мин'
                )}


                ${developmentMetric(
                    '🧘',
                    'Медитация',
                    x.meditationMinutes,
                    15,
                    'meditationMinutes',
                    ' мин'
                )}


                <div class="notice">

                    Прогресс сохраняется
                    автоматически.

                    XP и уровень развития
                    обновляются после изменения
                    показателей.

                </div>

            </div>

            `

        );

}


function developmentMetric(
    icon,
    title,
    value,
    target,
    action,
    suffix = ''
) {

    const p =
        percent(
            value,
            target
        );


    return `

        <div class="metric">

            <div class="metric-head">

                <div class="metric-left">

                    <div class="metric-icon">
                        ${icon}
                    </div>

                    <div class="metric-text">

                        <strong>
                            ${title}
                        </strong>

                        <span>
                            ${fmt(value)}${suffix}
                            / ${fmt(target)}${suffix}
                        </span>

                    </div>

                </div>

                <div class="metric-percent">
                    ${p}%
                </div>

            </div>

            <div class="metric-bar">

                <i
                    style="width:${p}%"
                ></i>

            </div>

            <button
                class="edit"
                type="button"
                data-development-action="${action}"
            >
                ИЗМЕНИТЬ
            </button>

        </div>

    `;

}


// ============================================================
// HOME PAGE
// ============================================================

function renderHomePage() {

    const page =
        document.querySelector(
            '.page'
        );


    if (!page) {
        return;
    }


    const progress =
        lifeProgress();


    page.innerHTML =
        pageShell(
            'Главная',

            `

            <div class="summary">

                <div class="section-label">
                    ОБЩИЙ ПРОГРЕСС
                </div>

                <div class="summary-number">
                    ${progress}%
                </div>

                <div class="progress">

                    <i
                        style="width:${progress}%"
                    ></i>

                </div>

            </div>


            <div class="cards">


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
                                    ${financeProgress()}%
                                </span>

                            </div>

                        </div>

                        <div class="metric-percent">
                            ${financeProgress()}%
                        </div>

                    </div>

                    <div class="metric-bar">

                        <i
                            style="width:${financeProgress()}%"
                        ></i>

                    </div>

                </div>


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
                                    ${healthProgress()}%
                                </span>

                            </div>

                        </div>

                        <div class="metric-percent">
                            ${healthProgress()}%
                        </div>

                    </div>

                    <div class="metric-bar">

                        <i
                            style="width:${healthProgress()}%"
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
                                    ${developmentProgress()}%
                                </span>

                            </div>

                        </div>

                        <div class="metric-percent">
                            ${developmentProgress()}%
                        </div>

                    </div>

                    <div class="metric-bar">

                        <i
                            style="width:${developmentProgress()}%"
                        ></i>

                    </div>

                </div>


            </div>

            `

        );

}


// ============================================================
// OPEN PAGE
// ============================================================

function openPage(
    pageName
) {

    const allowed = [
        'home',
        'finance',
        'health',
        'development'
    ];


    if (
        !allowed.includes(
            pageName
        )
    ) {

        return;

    }


    const existing =
        document.querySelector(
            '.page'
        );


    if (existing) {

        existing.remove();

    }


    const page =
        document.createElement(
            'div'
        );


    page.className =
        'page';


    document.body.appendChild(
        page
    );


    currentPage =
        pageName;


    document.body.classList.add(
        'locked'
    );


    document.querySelectorAll(
        '.nav button'
    ).forEach(button => {

        button.classList.toggle(
            'active',
            button.dataset.nav ===
            pageName
        );

    });


    if (
        pageName === 'finance'
    ) {

        renderFinancePage();

    }


    else if (
        pageName === 'health'
    ) {

        renderHealthPage();

    }


    else if (
        pageName === 'development'
    ) {

        renderDevelopmentPage();

    }


    else {

        renderHomePage();

    }


    setupPageHandlers();

}


// ============================================================
// CLOSE PAGE
// ============================================================

function closePage() {

    const page =
        document.querySelector(
            '.page'
        );


    if (page) {

        page.remove();

    }


    document.body.classList.remove(
        'locked'
    );


    currentPage =
        'home';


    document.querySelectorAll(
        '.nav button'
    ).forEach(button => {

        button.classList.toggle(
            'active',
            button.dataset.nav ===
            'home'
        );

    });


    updateHomeUI();

}


// ============================================================
// EDIT FINANCE
// ============================================================

function editIncome() {

    const current =
        state.categories.finance.monthlyIncome;


    const value =
        prompt(
            'Введите доход за месяц:',
            String(current || 0)
        );


    if (
        value === null
    ) {

        return;

    }


    const amount =
        Number(value);


    if (
        !Number.isFinite(amount) ||
        amount < 0
    ) {

        showToast(
            '⚠️ Введите корректную сумму'
        );

        return;

    }


    state.categories.finance.monthlyIncome =
        amount;


    addCategoryXP(
        'finance',
        15
    );


    saveGame();


    showToast(
        '💵 Доход обновлён'
    );


    renderFinancePage();
    updateHomeUI();

}


function editGoal() {

    const current =
        state.categories.finance.monthlyGoal;


    const value =
        prompt(
            'Введите цель за месяц:',
            String(current || 0)
        );


    if (
        value === null
    ) {

        return;

    }


    const amount =
        Number(value);


    if (
        !Number.isFinite(amount) ||
        amount < 0
    ) {

        showToast(
            '⚠️ Введите корректную сумму'
        );

        return;

    }


    state.categories.finance.monthlyGoal =
        amount;


    saveGame();


    showToast(
        '🎯 Цель обновлена'
    );


    renderFinancePage();
    updateHomeUI();

}


function editSavings() {

    const current =
        state.categories.finance.savings;


    const value =
        prompt(
            'Введите сумму накоплений:',
            String(current || 0)
        );


    if (
        value === null
    ) {

        return;

    }


    const amount =
        Number(value);


    if (
        !Number.isFinite(amount) ||
        amount < 0
    ) {

        showToast(
            '⚠️ Введите корректную сумму'
        );

        return;

    }


    state.categories.finance.savings =
        amount;


    addCategoryXP(
        'finance',
        10
    );


    saveGame();


    showToast(
        '🛡️ Накопления обновлены'
    );


    renderFinancePage();
    updateHomeUI();

}


// ============================================================
// ADD EXPENSE
// ============================================================

function addExpense() {

    const name =
        prompt(
            'Название обязательного расхода:'
        );


    if (
        !name ||
        !name.trim()
    ) {

        return;

    }


    const value =
        prompt(
            'Сумма расхода:'
        );


    if (
        value === null
    ) {

        return;

    }


    const amount =
        Number(value);


    if (
        !Number.isFinite(amount) ||
        amount <= 0
    ) {

        showToast(
            '⚠️ Введите корректную сумму'
        );

        return;

    }


    expenses.push({

        id:
            String(
                Date.now() +
                Math.random()
            ),

        name:
            name.trim(),

        amount:
            amount

    });


    saveGame();


    showToast(
        '💳 Расход добавлен'
    );


    renderFinancePage();
    updateHomeUI();

}


// ============================================================
// DELETE EXPENSE
// ============================================================

function deleteExpense(
    id
) {

    expenses =
        expenses.filter(
            expense =>
                String(expense.id) !==
                String(id)
        );


    saveGame();


    showToast(
        '🗑️ Расход удалён'
    );


    renderFinancePage();
    updateHomeUI();

}


// ============================================================
// TOGGLE EXPENSES
// ============================================================

function toggleExpenses() {

    ui.expensesCollapsed =
        !ui.expensesCollapsed;


    saveUI(
        ui
    );


    renderFinancePage();

}


// ============================================================
// HEALTH EDIT
// ============================================================

function editHealth(
    type
) {

    const health =
        state.categories.health;


    if (
        type === 'routine'
    ) {

        const value =
            prompt(
                'Режим дня (0-100):',
                String(
                    health.routine
                )
            );


        if (
            value === null
        ) {
            return;
        }


        const n =
            Number(value);


        if (
            !Number.isFinite(n)
        ) {
            return;
        }


        health.routine =
            clamp(
                n,
                0,
                100
            );


        addCategoryXP(
            'health',
            5
        );

    }


    else if (
        type === 'nutrition'
    ) {

        const value =
            prompt(
                'Питание (0-100):',
                String(
                    health.nutrition
                )
            );


        if (
            value === null
        ) {
            return;
        }


        const n =
            Number(value);


        if (
            !Number.isFinite(n)
        ) {
            return;
        }


        health.nutrition =
            clamp(
                n,
                0,
                100
            );


        addCategoryXP(
            'health',
            5
        );

    }


    else if (
        type === 'steps'
    ) {

        const value =
            prompt(
                'Количество шагов:',
                String(
                    health.steps
                )
            );


        if (
            value === null
        ) {
            return;
        }


        const n =
            Number(value);


        if (
            !Number.isFinite(n)
        ) {
            return;
        }


        health.steps =
            Math.max(
                0,
                Math.min(
                    100000,
                    n
                )
            );


        addCategoryXP(
            'health',
            3
        );

    }


    else if (
        type === 'workout'
    ) {

        state.categories.training.workouts++;


        addCategoryXP(
            'training',
            30
        );


        showToast(
            '🏋️ Тренировка выполнена'
        );

    }


    saveGame();


    renderHealthPage();
    updateHomeUI();

}


// ============================================================
// DEVELOPMENT EDIT
// ============================================================

function editDevelopment(
    type
) {

    const x =
        state.categories.development;


    let current = 0;
    let label = '';


    if (
        type === 'books'
    ) {

        current =
            x.books;

        label =
            'Количество прочитанных книг:';

    }


    else if (
        type === 'languageMinutes'
    ) {

        current =
            x.languageMinutes;

        label =
            'Минут изучения языка:';

    }


    else if (
        type === 'meditationMinutes'
    ) {

        current =
            x.meditationMinutes;

        label =
            'Минут медитации:';

    }


    const value =
        prompt(
            label,
            String(current)
        );


    if (
        value === null
    ) {

        return;

    }


    const n =
        Number(value);


    if (
        !Number.isFinite(n) ||
        n < 0
    ) {

        showToast(
            '⚠️ Введите корректное значение'
        );

        return;

    }


    x[type] =
        n;


    addCategoryXP(
        'development',
        10
    );


    saveGame();


    showToast(
        '🧠 Показатель развития обновлён'
    );


    renderDevelopmentPage();
    updateHomeUI();

}


// ============================================================
// DAILY QUEST
// ============================================================

function completeDailyQuest() {

    const button =
        document.getElementById(
            'dailyQuest'
        );


    if (
        button &&
        button.dataset.completed ===
        'true'
    ) {

        return;

    }


    const rewards = [

        {
            category: 'health',
            amount: 10,
            text: '❤️ +10 здоровья'
        },

        {
            category: 'finance',
            amount: 20,
            text: '💰 +20 финансового XP'
        },

        {
            category: 'development',
            amount: 10,
            text: '🧠 +10 XP развития'
        }

    ];


    const reward =
        rewards[
            Math.floor(
                Math.random() *
                rewards.length
            )
        ];


    addCategoryXP(
        reward.category,
        reward.amount
    );


    showToast(
        '⚡ Квест выполнен! ' +
        reward.text
    );


    if (button) {

        button.dataset.completed =
            'true';

        button.textContent =
            '✅ QUEST COMPLETED';

        button.style.opacity =
            '.5';

        button.disabled =
            true;


        setTimeout(() => {

            button.dataset.completed =
                'false';

            button.textContent =
                '⚡ DAILY QUEST';

            button.style.opacity =
                '1';

            button.disabled =
                false;

        }, 30000);

    }


    saveGame();
    updateAllUI();

}


// ============================================================
// PAGE HANDLERS
// ============================================================

function setupPageHandlers() {

    const page =
        document.querySelector(
            '.page'
        );


    if (!page) {
        return;
    }


    page.addEventListener(
        'click',
        function(event) {

            const actionElement =
                event.target.closest(
                    '[data-action]'
                );


            if (
                actionElement
            ) {

                const action =
                    actionElement.dataset.action;


                if (
                    action ===
                    'close-page'
                ) {

                    closePage();

                    return;

                }


                if (
                    action ===
                    'edit-income'
                ) {

                    editIncome();

                    return;

                }


                if (
                    action ===
                    'edit-goal'
                ) {

                    editGoal();

                    return;

                }


                if (
                    action ===
                    'edit-savings'
                ) {

                    editSavings();

                    return;

                }


                if (
                    action ===
                    'add-expense'
                ) {

                    addExpense();

                    return;

                }


                if (
                    action ===
                    'toggle-expenses'
                ) {

                    toggleExpenses();

                    return;

                }

            }


            const healthAction =
                event.target.closest(
                    '[data-health-action]'
                );


            if (
                healthAction
            ) {

                editHealth(
                    healthAction.dataset.healthAction
                );

                return;

            }


            const developmentAction =
                event.target.closest(
                    '[data-development-action]'
                );


            if (
                developmentAction
            ) {

                editDevelopment(
                    developmentAction.dataset.developmentAction
                );

                return;

            }

        }
    );


    setupExpenseSwipe(
        page
    );

}


// ============================================================
// EXPENSE SWIPE
// ============================================================

function setupExpenseSwipe(
    page
) {

    const rows =
        page.querySelectorAll(
            '.expense-swipe'
        );


    rows.forEach(row => {

        const expense =
            row.querySelector(
                '.expense'
            );


        if (!expense) {
            return;
        }


        let startX = 0;
        let currentX = 0;
        let swiping = false;


        expense.addEventListener(
            'touchstart',
            event => {

                if (
                    !event.touches.length
                ) {
                    return;
                }


                startX =
                    event.touches[0].clientX;

                currentX =
                    startX;

                swiping =
                    true;

            },
            {
                passive: true
            }
        );


        expense.addEventListener(
            'touchmove',
            event => {

                if (
                    !swiping ||
                    !event.touches.length
                ) {
                    return;
                }


                currentX =
                    event.touches[0].clientX;


                const delta =
                    currentX -
                    startX;


                if (
                    delta < 0
                ) {

                    const offset =
                        Math.max(
                            -76,
                            delta
                        );


                    expense.style.transform =
                        'translateX(' +
                        offset +
                        'px)';

                }

            },
            {
                passive: true
            }
        );


        expense.addEventListener(
            'touchend',
            () => {

                if (!swiping) {
                    return;
                }


                swiping =
                    false;


                const delta =
                    currentX -
                    startX;


                if (
                    delta < -45
                ) {

                    expense.classList.add(
                        'swiped'
                    );

                    expense.style.transform =
                        '';

                }

                else if (
                    delta > 30
                ) {

                    expense.classList.remove(
                        'swiped'
                    );

                    expense.style.transform =
                        '';

                }

                else {

                    expense.style.transform =
                        '';

                }

            }
        );


        expense.addEventListener(
            'click',
            () => {

                if (
                    expense.classList.contains(
                        'swiped'
                    )
                ) {

                    deleteExpense(
                        row.dataset.expenseId
                    );

                }

            }
        );

    });

}


// ============================================================
// NAVIGATION
// ============================================================

function setupNavigation() {

    const nav =
        document.querySelector(
            '.nav'
        );


    if (!nav) {

        console.error(
            'LIFE GAME: .nav not found'
        );

        return;

    }


    nav.addEventListener(
        'click',
        function(event) {

            const button =
                event.target.closest(
                    'button[data-nav]'
                );


            if (!button) {
                return;
            }


            const page =
                button.dataset.nav;


            openPage(
                page
            );

        }
    );

}


// ============================================================
// GLOBAL CLICKS
// ============================================================

function setupGlobalHandlers() {

    document.addEventListener(
        'click',
        function(event) {

            if (
                event.target ===
                document.querySelector(
                    '.page'
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

}


// ============================================================
// GLOBAL API
// ============================================================

window.LifeGame =
    {

        getState:
            () => state,

        save:
            saveGame,

        openPage:
            openPage,

        closePage:
            closePage,

        addXP:
            addPlayerXP,

        addCategoryXP:
            addCategoryXP,

        update:
            updateAllUI

    };


// Compatibility for old modules
window.showToast =
    showToast;

window.updateAllUI =
    updateAllUI;

window.updateLifeProgressUI =
    updateHomeUI;

window.addXP =
    addPlayerXP;

window.openCategoryPage =
    openPage;

window.closePage =
    closePage;

window.handleWorkout =
    () =>
        editHealth('workout');

window.handleHealthEdit =
    type =>
        editHealth(type);


// ============================================================
// INITIALIZATION
// ============================================================

function init() {

    console.log(
        '🚀 LIFE GAME — initializing'
    );


    loadGame();


    setupNavigation();


    setupGlobalHandlers();


    updateAllUI();


    console.log(
        '✅ LIFE GAME — application ready'
    );

}


// ============================================================
// DOM READY
// ============================================================

if (
    document.readyState ===
    'loading'
) {

    document.addEventListener(
        'DOMContentLoaded',
        init,
        {
            once: true
        }
    );

}

else {

    init();

}
```
