```javascript
// ================================================================
// LIFE GAME
// APP.JS
// Главный контроллер приложения
// ================================================================
//
// Подключает:
//
// ./utils.js
// ./xp.js
// ./finance.js
// ./health.js
// ./development.js
//
// Отвечает за:
//
// 1. Общее состояние приложения
// 2. LocalStorage
// 3. Главную страницу
// 4. Навигацию
// 5. Страницы категорий
// 6. Редактирование показателей
// 7. XP
// 8. Уровни
// 9. Общий прогресс LIFE
// 10. Daily Quest
// 11. Toast
//
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

import './finance.js';
import './health.js';
import './development.js';


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

    categories: {

        finance: {

            xp: 0,
            level: 1,
            streak: 0,
            bestStreak: 0,

            monthlyIncome: 0,
            monthlyGoal: 100000,
            yearlyGoal: 1200000,

            savings: 0,
            expenses: 0,
            expensesPercent: 0,
            savingsPercent: 0,
            financialHealth: 0

        },


        health: {

            xp: 0,
            level: 1,
            streak: 0,
            bestStreak: 0,

            routine: 0,
            nutrition: 0,
            steps: 0

        },


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
// STATE
// ================================================================

let state =
    loadState();


window.lifeGameState =
    state;


// ================================================================
// STATE HELPERS
// ================================================================

function createState() {

    return JSON.parse(
        JSON.stringify(
            DEFAULT_STATE
        )
    );

}


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

            if (
                source[key] &&
                typeof source[key] === 'object' &&
                !Array.isArray(source[key])
            ) {

                if (
                    !target[key] ||
                    typeof target[key] !== 'object'
                ) {

                    target[key] = {};

                }


                mergeState(
                    target[key],
                    source[key]
                );

            } else {

                target[key] =
                    source[key];

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


// ================================================================
// NORMALIZE STATE
// ================================================================

function normalizeState() {

    if (!state.categories) {

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
                !state.categories[category]
            ) {

                state.categories[category] =
                    {};

            }


            const data =
                state.categories[category];


            data.xp =
                Math.max(
                    0,
                    num(data.xp)
                );


            data.level =
                Math.max(
                    1,
                    num(data.level) || 1
                );


            data.streak =
                Math.max(
                    0,
                    num(data.streak)
                );


            data.bestStreak =
                Math.max(
                    0,
                    num(data.bestStreak)
                );

        }
    );

}


// ================================================================
// XP
// ================================================================

function calculateLevel(xp) {

    if (
        typeof levelFromXP ===
        'function'
    ) {

        return Math.max(
            1,
            num(
                levelFromXP(
                    Math.max(
                        0,
                        num(xp)
                    )
                )
            ) || 1
        );

    }


    return Math.max(
        1,
        Math.floor(
            Math.max(
                0,
                num(xp)
            ) / 100
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
            num(currentState.xp)
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
                    num(data.xp)
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


    const gained =
        xpWithStreak(
            Math.max(
                0,
                num(baseXP)
            ),
            Math.max(
                0,
                num(data.streak)
            )
        );


    data.xp +=
        gained;


    updateLevels(
        state
    );


    saveState();


    return gained;

}


// ================================================================
// CALCULATE CATEGORY PROGRESS
// ================================================================

function categoryProgress(
    category
) {

    if (
        category === 'finance' &&
        window.LifeGameFinance
    ) {

        return clamp(
            window.LifeGameFinance
                .financialHealth
                ? window.LifeGameFinance.financialHealth(
                    state.categories.finance.monthlyIncome,
                    state.categories.finance.monthlyGoal,
                    window.LifeGameFinance.totalExpenses(),
                    state.categories.finance.savings
                )
                : 0,
            0,
            100
        );

    }


    if (
        category === 'health' &&
        window.LifeGameHealth
    ) {

        return clamp(
            window.LifeGameHealth.progress(
                state
            ),
            0,
            100
        );

    }


    if (
        category === 'development' &&
        window.LifeGameDevelopment
    ) {

        return clamp(
            window.LifeGameDevelopment.progress(
                state
            ),
            0,
            100
        );

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
        num(level);


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
        num(xp)
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
// HELPERS FOR MODULES
// ================================================================

const moduleHelpers = {

    num,

    clamp,

    fmt,

    esc,

    percent,

    metric: function (
        icon,
        title,
        current,
        target,
        progress,
        id
    ) {

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
                        ${clamp(
                            progress,
                            0,
                            100
                        )}%
                    </div>

                </div>


                <div class="metric-bar">

                    <i
                        style="
                            width:${clamp(
                                progress,
                                0,
                                100
                            )}%;
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
        num(state.xp);


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
            xp - currentLevelBase
        );


    const xpPercent =
        clamp(
            Math.round(
                xpInsideLevel /
                100 *
                100
            ),
            0,
            100
        );


    document.getElementById(
        'playerLevel'
    ).textContent =
        `LVL ${level}`;


    document.getElementById(
        'playerXP'
    ).textContent =
        `${fmt(xp)} XP`;


    document.getElementById(
        'playerXPFill'
    ).style.width =
        `${xpPercent}%`;


    document.getElementById(
        'xpNext'
    ).textContent =
        `${fmt(xpNext)} XP TO NEXT LEVEL`;


    document.getElementById(
        'playerRank'
    ).textContent =
        rankFromLevel(
            level
        );


    document.getElementById(
        'lifeProgress'
    ).innerHTML =
        `${life}<span>%</span>`;


    document.getElementById(
        'lifeFill'
    ).style.width =
        `${life}%`;


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
            value,
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
// PAGE CONTAINER
// ================================================================

function createPage(
    category
) {

    closePage();


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
        closePage
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
            ${categoryTitle(
                category
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


    renderCategoryPage(
        category
    );


    document.body.classList.add(
        'locked'
    );


    initPageEvents();

}


// ================================================================
// CATEGORY TITLE
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
// OPEN CATEGORY
// ================================================================

function openCategoryPage(
    category
) {

    if (
        ![
            'finance',
            'health',
            'development'
        ].includes(category)
    ) {

        return;

    }


    createPage(
        category
    );

}


window.openCategoryPage =
    openCategoryPage;


// ================================================================
// RENDER CATEGORY
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


    let html = '';


    if (
        category === 'finance' &&
        window.LifeGameFinance
    ) {

        html =
            window.LifeGameFinance.page(
                state,
                moduleHelpers
            );

    }


    if (
        category === 'health' &&
        window.LifeGameHealth
    ) {

        html =
            window.LifeGameHealth.page(
                state,
                moduleHelpers
            );

    }


    if (
        category === 'development' &&
        window.LifeGameDevelopment
    ) {

        html =
            window.LifeGameDevelopment.page(
                state,
                moduleHelpers
            );

    }


    content.innerHTML =
        html;


    initPageEvents();


    if (
        category === 'finance' &&
        window.LifeGameFinance &&
        typeof window.LifeGameFinance
            .initExpenseSwipe ===
            'function'
    ) {

        window.LifeGameFinance
            .initExpenseSwipe();

    }

}


// ================================================================
// CLOSE PAGE
// ================================================================

function closePage() {

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


    renderApp();

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


    let category =
        '';


    if (title) {

        const text =
            title.textContent
                .trim()
                .toLowerCase();


        if (text === 'finance') {
            category = 'finance';
        }

        if (text === 'health') {
            category = 'health';
        }

        if (
            text === 'development'
        ) {

            category =
                'development';

        }

    }


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
            module.canEdit(id)
        ) {

            const oldValue =
                getMetricValue(
                    id
                );


            let success =
                false;


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
        num(data[id]);


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


    const number =
        Number(
            value.replace(
                /\s/g,
                ''
            )
        );


    if (
        !Number.isFinite(number) ||
        number < 0
    ) {

        showToast(
            '⚠️ Введите корректное значение'
        );


        return false;

    }


    data[id] =
        Math.round(number);


    return true;

}


// ================================================================
// METRIC VALUE
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


    return num(
        state.categories[
            category
        ][id]
    );

}


// ================================================================
// METRIC CATEGORY
// ================================================================

function metricCategory(
    id
) {

    if (
        window.LifeGameFinance &&
        typeof window.LifeGameFinance.canEdit ===
        'function' &&
        window.LifeGameFinance.canEdit(id)
    ) {

        return 'finance';

    }


    if (
        window.LifeGameHealth &&
        typeof window.LifeGameHealth.canEdit ===
        'function' &&
        window.LifeGameHealth.canEdit(id)
    ) {

        return 'health';

    }


    if (
        window.LifeGameDevelopment &&
        typeof window.LifeGameDevelopment.canEdit ===
        'function' &&
        window.LifeGameDevelopment.canEdit(id)
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
                            category === 'home'
                        ) {

                            closePage();

                            return;

                        }


                        setActiveNav(
                            category
                        );


                        openCategoryPage(
                            category
                        );

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


                        openCategoryPage(
                            category
                        );


                        setActiveNav(
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
        () => {

            completeDailyQuest();

        }
    );

}


// ================================================================
// DAILY QUEST COMPLETE
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
        xpWithStreak(
            10,
            0
        );


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

    categoryProgress

};


// ================================================================
// INIT
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
```
