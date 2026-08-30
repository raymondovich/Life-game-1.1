// ================================================================
// LIFE GAME
// APP.JS
// Главный контроллер приложения
// ================================================================

'use strict';


// ================================================================
// IMPORTS
// ================================================================

import {
    num,
    clamp,
    fmt,
    esc,
    percent
} from './utils.js';

import {
    xpWithStreak,
    levelFromXP
} from './xp.js';

import './sections/finance.js';
import './sections/health.js';
import './sections/development.js';


// ================================================================
// STORAGE
// ================================================================

const STORAGE_KEY =
    'life_game_data_v1';


// ================================================================
// DEFAULT STATE
// ================================================================

const DEFAULT_STATE = {

    xp: 0,

    level: 1,

    dailyQuestDate: null,

    categories: {

        // ============================================================
        // FINANCE
        // ============================================================

        finance: {

            xp: 0,

            level: 1,

            streak: 0,

            bestStreak: 0,

            // --------------------------------------------------------
            // Основные финансовые данные
            // --------------------------------------------------------

            monthlyIncome: 0,

            monthlyGoal: 0,

            mandatoryExpenses: 0,

            financialReserve: 0

        },


        // ============================================================
        // HEALTH
        // ============================================================

        health: {

            xp: 0,

            level: 1,

            streak: 0,

            bestStreak: 0,

            routine: 0,

            nutrition: 0,

            steps: 0

        },


        // ============================================================
        // DEVELOPMENT
        // ============================================================

        development: {

            xp: 0,

            level: 1,

            streak: 0,

            bestStreak: 0,

            books: 0,

            languageMinutes: 0,

            meditationMinutes: 0

        }

    }

};


// ================================================================
// CREATE STATE
// ================================================================

function createState() {

    return JSON.parse(
        JSON.stringify(
            DEFAULT_STATE
        )
    );

}


// ================================================================
// DEEP MERGE
// ================================================================

function mergeState(
    target,
    source
) {

    if (
        !source ||
        typeof source !== 'object'
    ) {

        return target;

    }


    Object.keys(source).forEach(
        key => {

            const sourceValue =
                source[key];


            if (
                sourceValue &&
                typeof sourceValue === 'object' &&
                !Array.isArray(sourceValue)
            ) {

                if (
                    !target[key] ||
                    typeof target[key] !== 'object' ||
                    Array.isArray(target[key])
                ) {

                    target[key] = {};

                }


                mergeState(
                    target[key],
                    sourceValue
                );

            } else {

                target[key] =
                    sourceValue;

            }

        }
    );


    return target;

}


// ================================================================
// LOAD STATE
// ================================================================

function loadState() {

    const fresh =
        createState();


    try {

        const raw =
            localStorage.getItem(
                STORAGE_KEY
            );


        if (!raw) {

            return fresh;

        }


        const saved =
            JSON.parse(raw);


        return mergeState(
            fresh,
            saved
        );

    } catch (error) {

        console.error(
            'LIFE GAME: failed to load state',
            error
        );


        return fresh;

    }

}


// ================================================================
// STATE
// ================================================================

let state =
    loadState();


window.lifeGameState =
    state;


// ================================================================
// SAVE STATE
// ================================================================

function saveState() {

    try {

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(state)
        );

    } catch (error) {

        console.error(
            'LIFE GAME: failed to save state',
            error
        );

    }

}


window.saveLifeGameState =
    saveState;


// ================================================================
// FINANCE MIGRATION
// ================================================================
//
// Переход со старой финансовой модели:
//
// monthlyIncome
// monthlyGoal
// yearlyGoal
// savings
// expenses
//
// на:
//
// monthlyIncome
// monthlyGoal
// mandatoryExpenses
// financialReserve
//
// ================================================================

function migrateFinance(
    finance
) {

    if (!finance) {

        return;

    }


    // --------------------------------------------------------------
    // Старые savings → financialReserve
    // --------------------------------------------------------------

    if (
        (
            finance.financialReserve === undefined ||
            finance.financialReserve === null
        ) &&
        finance.savings !== undefined
    ) {

        finance.financialReserve =
            Math.max(
                0,
                num(
                    finance.savings
                )
            );

    }


    // --------------------------------------------------------------
    // Старое числовое expenses → mandatoryExpenses
    // --------------------------------------------------------------

    if (
        (
            finance.mandatoryExpenses === undefined ||
            finance.mandatoryExpenses === null
        ) &&
        typeof finance.expenses === 'number'
    ) {

        finance.mandatoryExpenses =
            Math.max(
                0,
                num(
                    finance.expenses
                )
            );

    }


    // --------------------------------------------------------------
    // Если старый monthlyGoal существовал —
    // оставляем его.
    //
    // Если нет — 0.
    // --------------------------------------------------------------

    if (
        finance.monthlyGoal === undefined ||
        finance.monthlyGoal === null
    ) {

        finance.monthlyGoal = 0;

    }


    // --------------------------------------------------------------
    // Старые значения больше не используются
    // как основная модель.
    //
    // Мы намеренно их НЕ удаляем,
    // чтобы старые данные не потерялись.
    // --------------------------------------------------------------

}


// ================================================================
// NORMALIZE NUMBER
// ================================================================

function normalizeNumber(
    value,
    fallback = 0
) {

    const result =
        num(value);


    if (
        !Number.isFinite(result)
    ) {

        return fallback;

    }


    return result;

}


// ================================================================
// NORMALIZE STATE
// ================================================================

function normalizeState() {

    if (
        !state ||
        typeof state !== 'object'
    ) {

        state =
            createState();

    }


    if (
        !state.categories ||
        typeof state.categories !== 'object'
    ) {

        state.categories = {};

    }


    const categories = [
        'finance',
        'health',
        'development'
    ];


    categories.forEach(
        category => {

            if (
                !state.categories[category] ||
                typeof state.categories[category] !== 'object'
            ) {

                state.categories[category] =
                    {};

            }


            const data =
                state.categories[category];


            data.xp =
                Math.max(
                    0,
                    normalizeNumber(
                        data.xp
                    )
                );


            data.level =
                Math.max(
                    1,
                    normalizeNumber(
                        data.level,
                        1
                    ) || 1
                );


            data.streak =
                Math.max(
                    0,
                    normalizeNumber(
                        data.streak
                    )
                );


            data.bestStreak =
                Math.max(
                    0,
                    normalizeNumber(
                        data.bestStreak
                    )
                );

        }
    );


    // ============================================================
    // FINANCE NORMALIZATION
    // ============================================================

    const finance =
        state.categories.finance;


    migrateFinance(
        finance
    );


    finance.monthlyIncome =
        Math.max(
            0,
            normalizeNumber(
                finance.monthlyIncome
            )
        );


    finance.monthlyGoal =
        Math.max(
            0,
            normalizeNumber(
                finance.monthlyGoal
            )
        );


    finance.mandatoryExpenses =
        Math.max(
            0,
            normalizeNumber(
                finance.mandatoryExpenses
            )
        );


    finance.financialReserve =
        Math.max(
            0,
            normalizeNumber(
                finance.financialReserve
            )
        );


    // ============================================================
    // HEALTH
    // ============================================================

    const health =
        state.categories.health;


    health.routine =
        clamp(
            normalizeNumber(
                health.routine
            ),
            0,
            100
        );


    health.nutrition =
        clamp(
            normalizeNumber(
                health.nutrition
            ),
            0,
            100
        );


    health.steps =
        Math.max(
            0,
            normalizeNumber(
                health.steps
            )
        );


    // ============================================================
    // DEVELOPMENT
    // ============================================================

    const development =
        state.categories.development;


    development.books =
        Math.max(
            0,
            normalizeNumber(
                development.books
            )
        );


    development.languageMinutes =
        Math.max(
            0,
            normalizeNumber(
                development.languageMinutes
            )
        );


    development.meditationMinutes =
        Math.max(
            0,
            normalizeNumber(
                development.meditationMinutes
            )
        );


    // ============================================================
    // GLOBAL XP
    // ============================================================

    state.xp =
        Math.max(
            0,
            normalizeNumber(
                state.xp
            )
        );


    state.level =
        Math.max(
            1,
            normalizeNumber(
                state.level,
                1
            ) || 1
        );


    window.lifeGameState =
        state;

}


// ================================================================
// XP / LEVEL
// ================================================================

function calculateLevel(
    xp
) {

    const value =
        Math.max(
            0,
            normalizeNumber(
                xp
            )
        );


    if (
        typeof levelFromXP === 'function'
    ) {

        return Math.max(
            1,
            normalizeNumber(
                levelFromXP(
                    value
                ),
                1
            ) || 1
        );

    }


    return Math.max(
        1,
        Math.floor(
            value / 100
        ) + 1
    );

}


// ================================================================
// UPDATE LEVELS
// ================================================================

function updateLevels(
    currentState = state
) {

    currentState.xp =
        Math.max(
            0,
            normalizeNumber(
                currentState.xp
            )
        );


    currentState.level =
        calculateLevel(
            currentState.xp
        );


    Object.keys(
        currentState.categories || {}
    ).forEach(
        category => {

            const data =
                currentState.categories[
                    category
                ];


            if (!data) {

                return;

            }


            data.xp =
                Math.max(
                    0,
                    normalizeNumber(
                        data.xp
                    )
                );


            data.level =
                calculateLevel(
                    data.xp
                );

        }
    );


    window.lifeGameState =
        currentState;


    return currentState;

}


window.updateLevels =
    updateLevels;


// ================================================================
// ADD CATEGORY XP
// ================================================================

function addCategoryXP(
    category,
    baseXP = 5
) {

    const data =
        state.categories[
            category
        ];


    if (!data) {

        return 0;

    }


    const base =
        Math.max(
            0,
            normalizeNumber(
                baseXP
            )
        );


    let gained =
        base;


    if (
        typeof xpWithStreak === 'function'
    ) {

        gained =
            xpWithStreak(
                base,
                Math.max(
                    0,
                    normalizeNumber(
                        data.streak
                    )
                )
            );

    }


    data.xp +=
        gained;


    updateLevels(
        state
    );


    saveState();


    return gained;

}


// ================================================================
// FINANCE CALCULATIONS
// ================================================================

function financeCalculations() {

    const finance =
        state.categories.finance;


    const income =
        Math.max(
            0,
            normalizeNumber(
                finance.monthlyIncome
            )
        );


    const goal =
        Math.max(
            0,
            normalizeNumber(
                finance.monthlyGoal
            )
        );


    const expenses =
        Math.max(
            0,
            normalizeNumber(
                finance.mandatoryExpenses
            )
        );


    const reserve =
        Math.max(
            0,
            normalizeNumber(
                finance.financialReserve
            )
        );


    const incomeProgress =
        goal > 0
            ? (
                income /
                goal *
                100
            )
            : 0;


    const expensePercent =
        income > 0
            ? (
                expenses /
                income *
                100
            )
            : 0;


    const freeMoney =
        income -
        expenses -
        reserve;


    return {

        income,

        goal,

        expenses,

        reserve,

        incomeProgress,

        expensePercent,

        freeMoney

    };

}


window.lifeGameFinanceCalculations =
    financeCalculations;


// ================================================================
// CATEGORY PROGRESS
// ================================================================

function categoryProgress(
    category
) {

    // --------------------------------------------------------------
    // Finance
    // --------------------------------------------------------------

    if (
        category === 'finance' &&
        window.LifeGameFinance
    ) {

        if (
            typeof window.LifeGameFinance.progress ===
            'function'
        ) {

            return clamp(
                normalizeNumber(
                    window.LifeGameFinance.progress(
                        state
                    )
                ),
                0,
                100
            );

        }


        const finance =
            financeCalculations();


        return clamp(
            Math.round(
                finance.incomeProgress
            ),
            0,
            100
        );

    }


    // --------------------------------------------------------------
    // Health
    // --------------------------------------------------------------

    if (
        category === 'health' &&
        window.LifeGameHealth
    ) {

        if (
            typeof window.LifeGameHealth.progress ===
            'function'
        ) {

            return clamp(
                normalizeNumber(
                    window.LifeGameHealth.progress(
                        state
                    )
                ),
                0,
                100
            );

        }

    }


    // --------------------------------------------------------------
    // Development
    // --------------------------------------------------------------

    if (
        category === 'development' &&
        window.LifeGameDevelopment
    ) {

        if (
            typeof window.LifeGameDevelopment.progress ===
            'function'
        ) {

            return clamp(
                normalizeNumber(
                    window.LifeGameDevelopment.progress(
                        state
                    )
                ),
                0,
                100
            );

        }

    }


    return 0;

}


// ================================================================
// LIFE PROGRESS
// ================================================================

function lifeProgress() {

    const finance =
        categoryProgress(
            'finance'
        );


    const health =
        categoryProgress(
            'health'
        );


    const development =
        categoryProgress(
            'development'
        );


    return Math.round(
        (
            finance +
            health +
            development
        ) / 3
    );

}


// ================================================================
// RANK
// ================================================================

function rankFromLevel(
    level
) {

    const lv =
        normalizeNumber(
            level
        );


    if (lv >= 20) {

        return 'LEGEND';

    }


    if (lv >= 15) {

        return 'MASTER';

    }


    if (lv >= 10) {

        return 'ELITE';

    }


    if (lv >= 5) {

        return 'PLAYER';

    }


    return 'BEGINNER';

}


// ================================================================
// XP TO NEXT LEVEL
// ================================================================

function xpToNextLevel(
    xp
) {

    const currentLevel =
        calculateLevel(
            xp
        );


    const nextLevelXP =
        currentLevel * 100;


    return Math.max(
        0,
        nextLevelXP -
        normalizeNumber(
            xp
        )
    );

}


// ================================================================
// CREATOR
// ================================================================

function creatorHTML() {

    return `

        <a
            class="creator"
            href="https://t.me/shkeltinsh"
            target="_blank"
            rel="noopener noreferrer"
        >
            Created by
            <strong>
                &nbsp;@shkeltinsh
            </strong>
        </a>

    `;

}


// ================================================================
// MODULE HELPERS
// ================================================================

const moduleHelpers = {

    num,

    clamp,

    fmt,

    esc,

    percent,

    metric: function(
        icon,
        title,
        current,
        target,
        progress,
        id
    ) {

        const safeProgress =
            clamp(
                normalizeNumber(
                    progress
                ),
                0,
                100
            );


        return `

            <div
                class="metric"
                data-edit="${esc(id)}"
            >

                <div class="metric-head">

                    <div class="metric-left">

                        <div class="metric-icon">
                            ${icon}
                        </div>

                        <div class="metric-text">

                            <strong>
                                ${esc(title)}
                            </strong>

                            <span>
                                ${esc(current)}
                            </span>

                        </div>

                    </div>


                    <div class="metric-percent">
                        ${safeProgress}%
                    </div>

                </div>


                <div class="metric-bar">

                    <i
                        style="
                            width:${safeProgress}%;
                        "
                    ></i>

                </div>


                <button
                    type="button"
                    class="edit"
                    data-edit="${esc(id)}"
                >
                    ✎ ИЗМЕНИТЬ
                </button>

            </div>

        `;

    },


    creatorHTML

};


// ================================================================
// MAIN PAGE
// ================================================================

function homePage() {

    updateLevels(
        state
    );


    const finance =
        categoryProgress(
            'finance'
        );


    const health =
        categoryProgress(
            'health'
        );


    const development =
        categoryProgress(
            'development'
        );


    const life =
        lifeProgress();


    const xp =
        normalizeNumber(
            state.xp
        );


    const level =
        calculateLevel(
            xp
        );


    const xpNext =
        xpToNextLevel(
            xp
        );


    const currentLevelBase =
        (level - 1) * 100;


    const xpInsideLevel =
        Math.max(
            0,
            xp -
            currentLevelBase
        );


    const xpPercent =
        clamp(
            Math.round(
                xpInsideLevel
            ),
            0,
            100
        );


    const playerLevel =
        document.getElementById(
            'playerLevel'
        );


    if (playerLevel) {

        playerLevel.textContent =
            `LVL ${level}`;

    }


    const playerXP =
        document.getElementById(
            'playerXP'
        );


    if (playerXP) {

        playerXP.textContent =
            `${fmt(xp)} XP`;

    }


    const playerXPFill =
        document.getElementById(
            'playerXPFill'
        );


    if (playerXPFill) {

        playerXPFill.style.width =
            `${xpPercent}%`;

    }


    const xpNextElement =
        document.getElementById(
            'xpNext'
        );


    if (xpNextElement) {

        xpNextElement.textContent =
            `${fmt(xpNext)} XP TO NEXT LEVEL`;

    }


    const playerRank =
        document.getElementById(
            'playerRank'
        );


    if (playerRank) {

        playerRank.textContent =
            rankFromLevel(
                level
            );

    }


    const lifeProgressElement =
        document.getElementById(
            'lifeProgress'
        );


    if (lifeProgressElement) {

        lifeProgressElement.innerHTML =
            `${life}<span>%</span>`;

    }


    const lifeFill =
        document.getElementById(
            'lifeFill'
        );


    if (lifeFill) {

        lifeFill.style.width =
            `${life}%`;

    }


    setProgress(
        'finance',
        finance
    );


    setProgress(
        'health',
        health
    );


    setProgress(
        'development',
        development
    );

}


// ================================================================
// SET CATEGORY PROGRESS
// ================================================================

function setProgress(
    category,
    value
) {

    const percentElement =
        document.getElementById(
            `${category}Percent`
        );


    const fillElement =
        document.getElementById(
            `${category}Fill`
        );


    const p =
        clamp(
            normalizeNumber(
                value
            ),
            0,
            100
        );


    if (percentElement) {

        percentElement.textContent =
            `${p}%`;

    }


    if (fillElement) {

        fillElement.style.width =
            `${p}%`;

    }

}


// ================================================================
// CATEGORY TITLES
// ================================================================

function categoryTitle(
    category
) {

    const titles = {

        finance:
            'FINANCE',

        health:
            'HEALTH',

        development:
            'DEVELOPMENT'

    };


    return (
        titles[category] ||
        category
    );

}


// ================================================================
// CREATE CATEGORY PAGE
// ================================================================

function createPage(
    category
) {

    closePage(
        false
    );


    const page =
        document.createElement(
            'section'
        );


    page.className =
        'page';


    page.id =
        'categoryPage';


    const inner =
        document.createElement(
            'div'
        );


    inner.className =
        'page-inner';


    page.appendChild(
        inner
    );


    const header =
        document.createElement(
            'div'
        );


    header.className =
        'page-head';


    const back =
        document.createElement(
            'button'
        );


    back.type =
        'button';


    back.className =
        'back';


    back.innerHTML =
        '‹';


    back.addEventListener(
        'click',
        () => closePage()
    );


    const title =
        document.createElement(
            'div'
        );


    title.innerHTML = `

        <div class="page-eyebrow">
            LIFE GAME
        </div>

        <h2>
            ${esc(
                categoryTitle(
                    category
                )
            )}
        </h2>

    `;


    header.appendChild(
        back
    );


    header.appendChild(
        title
    );


    inner.appendChild(
        header
    );


    const content =
        document.createElement(
            'div'
        );


    content.id =
        'categoryPageContent';


    inner.appendChild(
        content
    );


    document.body.appendChild(
        page
    );


    document.body.classList.add(
        'locked'
    );


    renderCategoryPage(
        category
    );

}


// ================================================================
// OPEN CATEGORY PAGE
// ================================================================

function openCategoryPage(
    category
) {

    const allowed = [
        'finance',
        'health',
        'development'
    ];


    if (
        !allowed.includes(
            category
        )
    ) {

        return;

    }


    createPage(
        category
    );


    setActiveNav(
        category
    );

}


window.openCategoryPage =
    openCategoryPage;


// ================================================================
// RENDER CATEGORY PAGE
// ================================================================

function renderCategoryPage(
    category
) {

    const content =
        document.getElementById(
            'categoryPageContent'
        );


    if (!content) {

        return;

    }


    let html =
        '';


    // --------------------------------------------------------------
    // FINANCE
    // --------------------------------------------------------------

    if (
        category === 'finance' &&
        window.LifeGameFinance
    ) {

        if (
            typeof window.LifeGameFinance.page ===
            'function'
        ) {

            html =
                window.LifeGameFinance.page(
                    state,
                    moduleHelpers
                );

        }

    }


    // --------------------------------------------------------------
    // HEALTH
    // --------------------------------------------------------------

    if (
        category === 'health' &&
        window.LifeGameHealth
    ) {

        if (
            typeof window.LifeGameHealth.page ===
            'function'
        ) {

            html =
                window.LifeGameHealth.page(
                    state,
                    moduleHelpers
                );

        }

    }


    // --------------------------------------------------------------
    // DEVELOPMENT
    // --------------------------------------------------------------

    if (
        category === 'development' &&
        window.LifeGameDevelopment
    ) {

        if (
            typeof window.LifeGameDevelopment.page ===
            'function'
        ) {

            html =
                window.LifeGameDevelopment.page(
                    state,
                    moduleHelpers
                );

        }

    }


    content.innerHTML =
        html;


    initPageEvents();


    // --------------------------------------------------------------
    // Finance swipe support
    // --------------------------------------------------------------

    if (
        category === 'finance' &&
        window.LifeGameFinance &&
        typeof window.LifeGameFinance.initExpenseSwipe ===
        'function'
    ) {

        window.LifeGameFinance
            .initExpenseSwipe();

    }

}


// ================================================================
// CLOSE PAGE
// ================================================================

function closePage(
    shouldRender = true
) {

    const page =
        document.getElementById(
            'categoryPage'
        );


    if (page) {

        page.remove();

    }


    document.body.classList.remove(
        'locked'
    );


    setActiveNav(
        'home'
    );


    if (shouldRender) {

        renderApp();

    }

}


// ================================================================
// RENDER APP
// ================================================================

function renderApp() {

    normalizeState();

    updateLevels(
        state
    );


    saveState();


    homePage();

}


window.renderApp =
    renderApp;


// ================================================================
// REFRESH CURRENT PAGE
// ================================================================

function refreshCurrentPage() {

    const page =
        document.getElementById(
            'categoryPage'
        );


    if (!page) {

        renderApp();

        return;

    }


    const title =
        page.querySelector(
            '.page-head h2'
        );


    if (!title) {

        return;

    }


    const text =
        title.textContent
            .trim()
            .toLowerCase();


    const categoryMap = {

        finance:
            'finance',

        health:
            'health',

        development:
            'development'

    };


    const category =
        categoryMap[text];


    if (category) {

        renderCategoryPage(
            category
        );

    }

}


// ================================================================
// PAGE EVENTS
// ================================================================

function initPageEvents() {

    const page =
        document.getElementById(
            'categoryPage'
        );


    if (!page) {

        return;

    }


    page
        .querySelectorAll(
            '[data-edit]'
        )
        .forEach(
            button => {

                button.addEventListener(
                    'click',
                    event => {

                        event.preventDefault();

                        event.stopPropagation();


                        const id =
                            button.dataset.edit;


                        editMetric(
                            id
                        );

                    }
                );

            }
        );

}


// ================================================================
// EDIT METRIC
// ================================================================

function editMetric(
    id
) {

    const modules = [

        window.LifeGameFinance,

        window.LifeGameHealth,

        window.LifeGameDevelopment

    ];


    for (
        const module of modules
    ) {

        if (
            !module ||
            typeof module.canEdit !==
            'function'
        ) {

            continue;

        }


        if (
            !module.canEdit(
                id
            )
        ) {

            continue;

        }


        const oldValue =
            getMetricValue(
                id
            );


        let success =
            false;


        // ----------------------------------------------------------
        // Module-specific editor
        // ----------------------------------------------------------

        if (
            typeof module.edit ===
            'function'
        ) {

            success =
                module.edit(
                    state,
                    id
                ) !== false;

        } else {

            success =
                editGenericMetric(
                    module,
                    id
                );

        }


        if (!success) {

            return;

        }


        normalizeState();


        updateLevels(
            state
        );


        saveState();


        const newValue =
            getMetricValue(
                id
            );


        if (
            oldValue !==
            newValue
        ) {

            const category =
                metricCategory(
                    id
                );


            if (category) {

                addCategoryXP(
                    category,
                    5
                );

            }

        }


        saveState();


        renderApp();


        refreshCurrentPage();


        showToast(
            '✓ Сохранено'
        );


        return;

    }


    showToast(
        '⚠️ Показатель не найден'
    );

}


// ================================================================
// GENERIC EDIT
// ================================================================

function editGenericMetric(
    module,
    id
) {

    const labels =
        module.labels || {};


    const label =
        labels[id] ||
        id;


    const category =
        metricCategory(
            id
        );


    if (!category) {

        return false;

    }


    const data =
        state.categories[
            category
        ];


    const current =
        normalizeNumber(
            data[id]
        );


    const value =
        prompt(
            `Введите значение: ${label}`,
            String(current)
        );


    if (
        value === null ||
        value.trim() === ''
    ) {

        return false;

    }


    const cleaned =
        value
            .replace(
                /\s/g,
                ''
            )
            .replace(
                ',',
                '.'
            );


    const number =
        Number(
            cleaned
        );


    if (
        !Number.isFinite(
            number
        ) ||
        number < 0
    ) {

        showToast(
            '⚠️ Введите корректное значение'
        );


        return false;

    }


    data[id] =
        Math.round(
            number
        );


    return true;

}


// ================================================================
// GET METRIC VALUE
// ================================================================

function getMetricValue(
    id
) {

    const category =
        metricCategory(
            id
        );


    if (!category) {

        return null;

    }


    return normalizeNumber(
        state.categories[
            category
        ][id]
    );

}


// ================================================================
// FIND METRIC CATEGORY
// ================================================================

function metricCategory(
    id
) {

    if (
        window.LifeGameFinance &&
        typeof window.LifeGameFinance.canEdit ===
        'function' &&
        window.LifeGameFinance.canEdit(
            id
        )
    ) {

        return 'finance';

    }


    if (
        window.LifeGameHealth &&
        typeof window.LifeGameHealth.canEdit ===
        'function' &&
        window.LifeGameHealth.canEdit(
            id
        )
    ) {

        return 'health';

    }


    if (
        window.LifeGameDevelopment &&
        typeof window.LifeGameDevelopment.canEdit ===
        'function' &&
        window.LifeGameDevelopment.canEdit(
            id
        )
    ) {

        return 'development';

    }


    return null;

}


// ================================================================
// ACTIVE NAV
// ================================================================

function setActiveNav(
    category
) {

    document
        .querySelectorAll(
            '.nav button'
        )
        .forEach(
            button => {

                button.classList.toggle(
                    'active',
                    button.dataset.nav ===
                    category
                );

            }
        );

}


window.setActiveNav =
    setActiveNav;


// ================================================================
// NAVIGATION
// ================================================================

function initNavigation() {

    document
        .querySelectorAll(
            '.nav button'
        )
        .forEach(
            button => {

                button.addEventListener(
                    'click',
                    () => {

                        const category =
                            button.dataset.nav;


                        if (
                            category ===
                            'home'
                        ) {

                            closePage();

                            return;

                        }


                        if (
                            [
                                'finance',
                                'health',
                                'development'
                            ].includes(
                                category
                            )
                        ) {

                            openCategoryPage(
                                category
                            );

                        }

                    }
                );

            }
        );

}


// ================================================================
// CATEGORY CARDS
// ================================================================

function initCategoryCards() {

    document
        .querySelectorAll(
            '.category'
        )
        .forEach(
            card => {

                card.addEventListener(
                    'click',
                    () => {

                        const category =
                            card.dataset.category;


                        if (
                            ![
                                'finance',
                                'health',
                                'development'
                            ].includes(
                                category
                            )
                        ) {

                            return;

                        }


                        openCategoryPage(
                            category
                        );

                    }
                );

            }
        );

}


// ================================================================
// DAILY QUEST
// ================================================================

function initDailyQuest() {

    const button =
        document.getElementById(
            'dailyQuest'
        );


    if (!button) {

        return;

    }


    button.addEventListener(
        'click',
        completeDailyQuest
    );

}


// ================================================================
// COMPLETE DAILY QUEST
// ================================================================

function completeDailyQuest() {

    const today =
        new Date()
            .toISOString()
            .slice(
                0,
                10
            );


    if (
        state.dailyQuestDate ===
        today
    ) {

        showToast(
            '⚡ Daily Quest уже выполнен'
        );


        return;

    }


    const gained =
        typeof xpWithStreak ===
        'function'
            ? xpWithStreak(
                10,
                0
            )
            : 10;


    state.xp +=
        gained;


    state.dailyQuestDate =
        today;


    updateLevels(
        state
    );


    saveState();


    renderApp();


    showToast(
        `⚡ +${gained} XP`
    );

}


// ================================================================
// TOAST
// ================================================================

let toastTimer =
    null;


function showToast(
    message
) {

    const toast =
        document.getElementById(
            'toast'
        );


    if (!toast) {

        return;

    }


    toast.textContent =
        message;


    toast.classList.add(
        'show'
    );


    clearTimeout(
        toastTimer
    );


    toastTimer =
        setTimeout(
            () => {

                toast.classList.remove(
                    'show'
                );

            },
            2200
        );

}


window.showToast =
    showToast;


// ================================================================
// PUBLIC API
// ================================================================

window.LifeGameApp = {

    getState:
        () => state,

    saveState,

    loadState,

    renderApp,

    openCategoryPage,

    closePage,

    addCategoryXP,

    updateLevels,

    lifeProgress,

    categoryProgress,

    financeCalculations,

    normalizeState

};


// ================================================================
// INITIALIZATION
// ================================================================

function init() {

    normalizeState();


    updateLevels(
        state
    );


    saveState();


    initNavigation();

    initCategoryCards();

    initDailyQuest();


    renderApp();


    console.log(
        'LIFE GAME: app.js loaded'
    );

}


// ================================================================
// DOM READY
// ================================================================

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

} else {

    init();

}