```javascript
// =====================================================
// LIFE GAME
// APP.JS
// Главный координатор приложения
// =====================================================

'use strict';


// =====================================================
// CORE MODULES
// =====================================================

import {
    createDefaultState
} from './state.js';

import {
    loadState,
    saveState
} from './storage.js';

import {
    clamp,
    fmt,
    esc,
    percent
} from './utilities.js';

import {
    levelFromXP,
    xpForLevel,
    playerXPFromCategoryXP
} from './xp.js';


// =====================================================
// GLOBAL APPLICATION STATE
// =====================================================

let state = null;

let currentPage = 'home';

let modulesLoaded = false;


// =====================================================
// MODULE REFERENCES
// =====================================================

let Finance = null;
let Health = null;
let Development = null;


// =====================================================
// NORMALIZE STATE
// =====================================================

function normalizeState(input) {

    const defaults =
        createDefaultState();

    const source =
        input && typeof input === 'object'
            ? input
            : {};

    const result =
        JSON.parse(
            JSON.stringify(defaults)
        );


    // -------------------------------------------------
    // PLAYER
    // -------------------------------------------------

    result.player = {
        ...result.player,
        ...(source.player || {})
    };


    // -------------------------------------------------
    // CATEGORIES
    // -------------------------------------------------

    result.categories = {
        ...result.categories,
        ...(source.categories || {})
    };


    Object.keys(
        defaults.categories
    ).forEach(category => {

        result.categories[category] = {
            ...defaults.categories[category],
            ...(source.categories?.[category] || {})
        };

    });


    // -------------------------------------------------
    // SIMULATOR
    // -------------------------------------------------

    result.simulator = {
        ...result.simulator,
        ...(source.simulator || {})
    };


    // -------------------------------------------------
    // QUESTS
    // -------------------------------------------------

    if (Array.isArray(source.quests)) {

        result.quests =
            source.quests;

    }


    // -------------------------------------------------
    // NUMERIC SAFETY
    // -------------------------------------------------

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

    result.player.rating =
        Number(result.player.rating) || 0;


    // -------------------------------------------------
    // CATEGORY XP / LEVEL
    // -------------------------------------------------

    Object.keys(
        result.categories
    ).forEach(category => {

        const x =
            result.categories[category];

        x.xp =
            Math.max(
                0,
                Number(x.xp) || 0
            );

        x.level =
            Math.max(
                1,
                Number(x.level) || 1
            );

        x.streak =
            Math.max(
                0,
                Number(x.streak) || 0
            );

        x.bestStreak =
            Math.max(
                0,
                Number(x.bestStreak) || 0
            );

    });


    return result;

}


// =====================================================
// LOAD MODULES
// =====================================================

async function loadApplicationModules() {

    try {

        /*
         * Modules are loaded dynamically.
         *
         * This allows both architectures:
         *
         * 1. ES module export
         * 2. window.LifeGame...
         *
         * to work.
         */


        const [
            financeModule,
            healthModule,
            developmentModule
        ] = await Promise.all([

            import('./finance.js'),

            import('./health.js'),

            import('./development.js')

        ]);


        Finance =
            financeModule.default ||
            financeModule.LifeGameFinance ||
            window.LifeGameFinance ||
            null;


        Health =
            healthModule.default ||
            healthModule.LifeGameHealth ||
            window.LifeGameHealth ||
            null;


        Development =
            developmentModule.default ||
            developmentModule.LifeGameDevelopment ||
            window.LifeGameDevelopment ||
            null;


        /*
         * Some versions of the modules register
         * themselves on window after execution.
         */

        if (!Finance) {

            Finance =
                window.LifeGameFinance ||
                null;

        }

        if (!Health) {

            Health =
                window.LifeGameHealth ||
                null;

        }

        if (!Development) {

            Development =
                window.LifeGameDevelopment ||
                null;

        }


        modulesLoaded = true;


        console.log(
            'LIFE GAME: modules loaded',
            {
                finance: !!Finance,
                health: !!Health,
                development: !!Development
            }
        );


    } catch (error) {

        console.error(
            'LIFE GAME: module loading error',
            error
        );

        /*
         * We do not stop the application completely.
         * This makes debugging easier.
         */

        modulesLoaded = true;

    }

}


// =====================================================
// MODULE HELPERS
// =====================================================

function getHelpers() {

    return {

        metric: createMetric,

        fmt,

        clamp,

        esc,

        percent,

        creatorHTML,

        state

    };

}


// =====================================================
// CREATOR
// =====================================================

function creatorHTML() {

    return `
        <a
            class="creator"
            href="https://t.me/shkeltinsh"
            target="_blank"
            rel="noopener noreferrer"
        >
            Created by
            <strong>&nbsp;@shkeltinsh</strong>
        </a>
    `;

}


// =====================================================
// METRIC
// =====================================================

function createMetric(
    icon,
    title,
    value,
    target,
    progress,
    id
) {

    const p =
        clamp(
            progress,
            0,
            100
        );


    return `
        <div
            class="metric"
            data-metric="${esc(id || '')}"
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
                            ${esc(value)}
                            ${target
                                ? ` / ${esc(target)}`
                                : ''
                            }
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

        </div>
    `;

}


// =====================================================
// INIT
// =====================================================

async function initApp() {

    console.log(
        '🚀 LIFE GAME — starting'
    );


    // -------------------------------------------------
    // LOAD MODULES
    // -------------------------------------------------

    await loadApplicationModules();


    // -------------------------------------------------
    // LOAD STATE
    // -------------------------------------------------

    state =
        loadState(
            normalizeState
        );


    if (!state) {

        state =
            createDefaultState();

    }


    // -------------------------------------------------
    // GLOBAL STATE
    // -------------------------------------------------

    window.lifeGameState =
        state;


    // -------------------------------------------------
    // INITIAL UI
    // -------------------------------------------------

    updateAllUI();


    // -------------------------------------------------
    // NAVIGATION
    // -------------------------------------------------

    setupNavigation();


    // -------------------------------------------------
    // HOME CATEGORY CLICK
    // -------------------------------------------------

    setupCategoryClicks();


    // -------------------------------------------------
    // DAILY QUEST
    // -------------------------------------------------

    setupDailyQuest();


    // -------------------------------------------------
    // GENERAL EVENTS
    // -------------------------------------------------

    setupGlobalEvents();


    // -------------------------------------------------
    // GLOBAL API
    // -------------------------------------------------

    exposeGlobalAPI();


    console.log(
        '✅ LIFE GAME — application ready'
    );

}


// =====================================================
// SAVE
// =====================================================

function persist() {

    if (!state) {
        return;
    }

    try {

        saveState(state);

    } catch (error) {

        console.error(
            'LIFE GAME: save error',
            error
        );

    }

}


// =====================================================
// UPDATE ALL UI
// =====================================================

function updateAllUI() {

    if (!state) {
        return;
    }


    updatePlayerUI();

    updateLifeUI();

    updateCategoryCards();

    persist();

}


// =====================================================
// PLAYER UI
// =====================================================

function updatePlayerUI() {

    const player =
        state.player;


    const level =
        Math.max(
            1,
            Number(player.level) || 1
        );


    const xp =
        Math.max(
            0,
            Number(player.xp) || 0
        );


    const required =
        xpForLevel(
            level + 1
        );


    const xpPercent =
        required > 0
            ? clamp(
                Math.round(
                    xp / required * 100
                ),
                0,
                100
            )
            : 0;


    const levelEl =
        document.getElementById(
            'playerLevel'
        );

    const xpEl =
        document.getElementById(
            'playerXP'
        );

    const xpFill =
        document.getElementById(
            'playerXPFill'
        );

    const xpNext =
        document.getElementById(
            'xpNext'
        );

    const rankEl =
        document.getElementById(
            'playerRank'
        );


    if (levelEl) {

        levelEl.textContent =
            `LVL ${level}`;

    }


    if (xpEl) {

        xpEl.textContent =
            `${fmt(xp)} XP`;

    }


    if (xpFill) {

        xpFill.style.width =
            `${xpPercent}%`;

    }


    if (xpNext) {

        xpNext.textContent =
            `${fmt(
                Math.max(
                    0,
                    required - xp
                )
            )} XP TO NEXT LEVEL`;

    }


    if (rankEl) {

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


        rankEl.textContent =
            ranks[index];

    }

}


// =====================================================
// LIFE PROGRESS
// =====================================================

function calculateCategoryProgress(
    category
) {

    const x =
        state.categories[category];


    if (!x) {
        return 0;
    }


    // -------------------------------------------------
    // FINANCE
    // -------------------------------------------------

    if (
        category === 'finance' &&
        Finance &&
        typeof Finance.progress === 'function'
    ) {

        return clamp(
            Finance.progress(state),
            0,
            100
        );

    }


    // -------------------------------------------------
    // HEALTH
    // -------------------------------------------------

    if (
        category === 'health' &&
        Health &&
        typeof Health.progress === 'function'
    ) {

        return clamp(
            Health.progress(state),
            0,
            100
        );

    }


    // -------------------------------------------------
    // DEVELOPMENT
    // -------------------------------------------------

    if (
        category === 'development' &&
        Development &&
        typeof Development.progress === 'function'
    ) {

        return clamp(
            Development.progress(state),
            0,
            100
        );

    }


    // -------------------------------------------------
    // FALLBACK
    // -------------------------------------------------

    if (
        category === 'development'
    ) {

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


    if (
        category === 'health'
    ) {

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


        return Math.round(
            (
                routine +
                nutrition +
                steps
            ) / 3
        );

    }


    return clamp(
        Number(x.level) || 0,
        0,
        100
    );

}


// =====================================================
// LIFE UI
// =====================================================

function updateLifeUI() {

    const finance =
        calculateCategoryProgress(
            'finance'
        );

    const health =
        calculateCategoryProgress(
            'health'
        );

    const development =
        calculateCategoryProgress(
            'development'
        );


    const values = [

        finance,

        health,

        development

    ];


    const progress =
        Math.round(
            values.reduce(
                (sum, value) =>
                    sum + value,
                0
            ) / values.length
        );


    const lifeEl =
        document.getElementById(
            'lifeProgress'
        );

    const lifeFill =
        document.getElementById(
            'lifeFill'
        );


    if (lifeEl) {

        lifeEl.innerHTML =
            `${progress}<span>%</span>`;

    }


    if (lifeFill) {

        lifeFill.style.width =
            `${progress}%`;

    }

}


// =====================================================
// CATEGORY CARDS
// =====================================================

function updateCategoryCards() {

    updateCategoryCard(
        'finance',
        calculateCategoryProgress(
            'finance'
        )
    );


    updateCategoryCard(
        'health',
        calculateCategoryProgress(
            'health'
        )
    );


    updateCategoryCard(
        'development',
        calculateCategoryProgress(
            'development'
        )
    );

}


// =====================================================
// SINGLE CATEGORY CARD
// =====================================================

function updateCategoryCard(
    category,
    value
) {

    const percentEl =
        document.getElementById(
            `${category}Percent`
        );

    const fillEl =
        document.getElementById(
            `${category}Fill`
        );


    const p =
        clamp(
            Math.round(value),
            0,
            100
        );


    if (percentEl) {

        percentEl.textContent =
            `${p}%`;

    }


    if (fillEl) {

        fillEl.style.width =
            `${p}%`;

    }

}


// =====================================================
// NAVIGATION
// =====================================================

function setupNavigation() {

    document
        .querySelectorAll(
            '.nav button'
        )
        .forEach(button => {

            button.addEventListener(
                'click',
                () => {

                    const page =
                        button.dataset.nav;

                    if (!page) {
                        return;
                    }

                    openPage(page);

                }
            );

        });

}


// =====================================================
// CATEGORY CLICKS
// =====================================================

function setupCategoryClicks() {

    document
        .querySelectorAll(
            '.category[data-category]'
        )
        .forEach(card => {

            card.addEventListener(
                'click',
                () => {

                    const category =
                        card.dataset.category;

                    if (category) {

                        openPage(
                            category
                        );

                    }

                }
            );

        });

}


// =====================================================
// OPEN PAGE
// =====================================================

function openPage(
    pageName
) {

    if (!state) {
        return;
    }


    closePage(
        false
    );


    const page =
        document.createElement(
            'div'
        );


    page.className =
        'page';


    page.dataset.page =
        pageName;


    let html = '';


    // -------------------------------------------------
    // HOME
    // -------------------------------------------------

    if (
        pageName === 'home'
    ) {

        html =
            createHomePage();

    }


    // -------------------------------------------------
    // FINANCE
    // -------------------------------------------------

    else if (
        pageName === 'finance'
    ) {

        html =
            createModulePage(
                Finance,
                'finance'
            );

    }


    // -------------------------------------------------
    // HEALTH
    // -------------------------------------------------

    else if (
        pageName === 'health'
    ) {

        html =
            createModulePage(
                Health,
                'health'
            );

    }


    // -------------------------------------------------
    // DEVELOPMENT
    // -------------------------------------------------

    else if (
        pageName === 'development'
    ) {

        html =
            createModulePage(
                Development,
                'development'
            );

    }


    else {

        return;

    }


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


    updateActiveNavigation(
        pageName
    );


    setupPageHandlers(
        pageName
    );

}


// =====================================================
// CREATE MODULE PAGE
// =====================================================

function createModulePage(
    module,
    category
) {

    if (
        module &&
        typeof module.page === 'function'
    ) {

        return module.page(
            state,
            getHelpers()
        );

    }


    return `

        <div class="page-inner">

            <div class="page-head">

                <button
                    class="back"
                    type="button"
                    onclick="closePage()"
                >
                    ←
                </button>

                <h2>
                    ${esc(
                        category
                    )}
                </h2>

            </div>

            <div class="notice">

                Модуль ${esc(category)}
                не загружен.

            </div>

        </div>

    `;

}


// =====================================================
// HOME PAGE
// =====================================================

function createHomePage() {

    const finance =
        calculateCategoryProgress(
            'finance'
        );

    const health =
        calculateCategoryProgress(
            'health'
        );

    const development =
        calculateCategoryProgress(
            'development'
        );


    const progress =
        Math.round(
            (
                finance +
                health +
                development
            ) / 3
        );


    return `

        <div class="page-inner">

            <div class="page-head">

                <button
                    class="back"
                    type="button"
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
                    LIFE PROGRESS
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

                ${homeMetric(
                    '❤️',
                    'Здоровье',
                    health
                )}

                ${homeMetric(
                    '💰',
                    'Финансы',
                    finance
                )}

                ${homeMetric(
                    '🧠',
                    'Развитие',
                    development
                )}

            </div>

        </div>

    `;

}


// =====================================================
// HOME METRIC
// =====================================================

function homeMetric(
    icon,
    title,
    value
) {

    const p =
        clamp(
            Math.round(value),
            0,
            100
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
                            ${p}%
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

        </div>

    `;

}


// =====================================================
// ACTIVE NAV
// =====================================================

function updateActiveNavigation(
    pageName
) {

    document
        .querySelectorAll(
            '.nav button'
        )
        .forEach(button => {

            button.classList.toggle(
                'active',
                button.dataset.nav ===
                    pageName
            );

        });

}


// =====================================================
// CLOSE PAGE
// =====================================================

function closePage(
    updateNavigation = true
) {

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


    if (updateNavigation) {

        updateActiveNavigation(
            'home'
        );

    }

}


// =====================================================
// PAGE HANDLERS
// =====================================================

function setupPageHandlers(
    pageName
) {

    const page =
        document.querySelector(
            '.page'
        );


    if (!page) {
        return;
    }


    /*
     * Allow modules to install their
     * own event handlers.
     */

    let module = null;


    if (
        pageName === 'finance'
    ) {

        module =
            Finance;

    }

    else if (
        pageName === 'health'
    ) {

        module =
            Health;

    }

    else if (
        pageName === 'development'
    ) {

        module =
            Development;

    }


    if (
        module &&
        typeof module.mount === 'function'
    ) {

        try {

            module.mount(
                page,
                state,
                getHelpers()
            );

        } catch (error) {

            console.error(
                `LIFE GAME: ${pageName} mount error`,
                error
            );

        }

    }


    /*
     * Generic buttons used by modules.
     */

    page
        .querySelectorAll(
            '[data-action]'
        )
        .forEach(button => {

            button.addEventListener(
                'click',
                event => {

                    const action =
                        button.dataset.action;

                    handleAction(
                        action,
                        button,
                        event
                    );

                }
            );

        });

}


// =====================================================
// GENERIC ACTION HANDLER
// =====================================================

function handleAction(
    action,
    button,
    event
) {

    if (!action) {
        return;
    }


    // -------------------------------------------------
    // CLOSE
    // -------------------------------------------------

    if (
        action === 'close'
    ) {

        closePage();

        return;

    }


    // -------------------------------------------------
    // SAVE
    // -------------------------------------------------

    if (
        action === 'save'
    ) {

        persist();

        updateAllUI();

        return;

    }


    /*
     * Try to call a global function.
     */

    if (
        typeof window[action] ===
        'function'
    ) {

        try {

            window[action](
                button,
                event
            );

        } catch (error) {

            console.error(
                `LIFE GAME: action ${action} error`,
                error
            );

        }

    }

}


// =====================================================
// DAILY QUEST
// =====================================================

function setupDailyQuest() {

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


// =====================================================
// DAILY QUEST LOGIC
// =====================================================

function completeDailyQuest() {

    if (!state) {
        return;
    }


    const quests =
        Array.isArray(state.quests)
            ? state.quests
            : [];


    const available =
        quests.filter(
            quest =>
                !quest.done
        );


    if (
        available.length === 0
    ) {

        showToast(
            '⚡ Все квесты выполнены'
        );

        return;

    }


    const quest =
        available[0];


    const category =
        state.categories[
            quest.category
        ];


    const reward =
        Math.max(
            0,
            Number(quest.xp) || 0
        );


    if (category) {

        category.xp +=
            reward;


        category.level =
            levelFromXP(
                category.xp
            );

    }


    const playerReward =
        playerXPFromCategoryXP(
            reward
        );


    state.player.xp +=
        playerReward;


    state.player.level =
        levelFromXP(
            state.player.xp
        );


    quest.done =
        true;


    persist();


    updateAllUI();


    showToast(
        `⚡ Квест выполнен! +${reward} XP`
    );


    const button =
        document.getElementById(
            'dailyQuest'
        );


    if (button) {

        button.textContent =
            '✅ QUEST COMPLETED';

        button.disabled =
            true;

        button.style.opacity =
            '.5';

    }


    /*
     * Daily reset for current session.
     * The permanent quest state remains in storage.
     */

    setTimeout(
        () => {

            if (!button) {
                return;
            }

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


// =====================================================
// GLOBAL EVENTS
// =====================================================

function setupGlobalEvents() {

    // -------------------------------------------------
    // CLICK OUTSIDE PAGE
    // -------------------------------------------------

    document.addEventListener(
        'click',
        event => {

            const page =
                document.querySelector(
                    '.page'
                );


            if (
                page &&
                event.target === page
            ) {

                closePage();

            }

        }
    );


    // -------------------------------------------------
    // ESC
    // -------------------------------------------------

    document.addEventListener(
        'keydown',
        event => {

            if (
                event.key === 'Escape'
            ) {

                closePage();

            }

        }
    );


    // -------------------------------------------------
    // BACK SWIPE
    // -------------------------------------------------

    setupBackSwipe();

}


// =====================================================
// MOBILE BACK SWIPE
// =====================================================

function setupBackSwipe() {

    let startX = 0;

    let startY = 0;

    let tracking = false;


    document.addEventListener(
        'touchstart',
        event => {

            if (
                !document.querySelector(
                    '.page'
                )
            ) {
                return;
            }


            const touch =
                event.touches[0];


            if (!touch) {
                return;
            }


            /*
             * iPhone-style edge swipe.
             */

            if (
                touch.clientX > 35
            ) {

                return;

            }


            startX =
                touch.clientX;

            startY =
                touch.clientY;

            tracking =
                true;

        },
        {
            passive: true
        }
    );


    document.addEventListener(
        'touchend',
        event => {

            if (!tracking) {
                return;
            }


            tracking =
                false;


            const touch =
                event.changedTouches[0];


            if (!touch) {
                return;
            }


            const dx =
                touch.clientX -
                startX;


            const dy =
                Math.abs(
                    touch.clientY -
                    startY
                );


            if (
                dx > 80 &&
                dy < 100
            ) {

                closePage();

            }

        },
        {
            passive: true
        }
    );

}


// =====================================================
// TOAST
// =====================================================

function showToast(
    message
) {

    /*
     * Reuse existing toast if available.
     */

    let toast =
        document.querySelector(
            '.toast'
        );


    if (!toast) {

        toast =
            document.createElement(
                'div'
            );

        toast.className =
            'toast';

        document.body.appendChild(
            toast
        );

    }


    toast.textContent =
        String(message);


    toast.classList.add(
        'show'
    );


    clearTimeout(
        toast._lifeGameTimer
    );


    toast._lifeGameTimer =
        setTimeout(
            () => {

                toast.classList.remove(
                    'show'
                );

            },
            2500
        );

}


// =====================================================
// ADD PLAYER XP
// =====================================================

function addXP(
    amount
) {

    if (!state) {
        return;
    }


    const value =
        Math.max(
            0,
            Number(amount) || 0
        );


    if (value <= 0) {
        return;
    }


    state.player.xp +=
        value;


    const oldLevel =
        state.player.level;


    state.player.level =
        levelFromXP(
            state.player.xp
        );


    persist();


    updateAllUI();


    if (
        state.player.level >
        oldLevel
    ) {

        showToast(
            `🎉 УРОВЕНЬ ПОВЫШЕН! LVL ${state.player.level}`
        );

    }

}


// =====================================================
// CATEGORY XP
// =====================================================

function addCategoryXP(
    categoryName,
    amount
) {

    if (!state) {
        return;
    }


    const category =
        state.categories[
            categoryName
        ];


    if (!category) {
        return;
    }


    const value =
        Math.max(
            0,
            Number(amount) || 0
        );


    category.xp +=
        value;


    category.level =
        levelFromXP(
            category.xp
        );


    /*
     * Category XP also contributes
     * to player XP.
     */

    addXP(
        playerXPFromCategoryXP(
            value
        )
    );


    persist();


    updateAllUI();

}


// =====================================================
// UPDATE CURRENT PAGE
// =====================================================

function refreshCurrentPage() {

    if (
        currentPage === 'home'
    ) {

        return;

    }


    const page =
        document.querySelector(
            '.page'
        );


    if (!page) {
        return;
    }


    openPage(
        currentPage
    );

}


// =====================================================
// GLOBAL API
// =====================================================

function exposeGlobalAPI() {

    window.openPage =
        openPage;


    window.closePage =
        closePage;


    window.showToast =
        showToast;


    window.updateAllUI =
        updateAllUI;


    window.addXP =
        addXP;


    window.addCategoryXP =
        addCategoryXP;


    window.persistLifeGame =
        persist;


    window.refreshCurrentPage =
        refreshCurrentPage;


    /*
     * Expose state.
     */

    window.getLifeGameState =
        () => state;


    /*
     * Compatibility.
     */

    window.lifeGame =
        {

            get state() {

                return state;

            },

            save:
                persist,

            update:
                updateAllUI,

            openPage,

            closePage,

            toast:
                showToast,

            addXP,

            addCategoryXP

        };

}


// =====================================================
// START
// =====================================================

if (
    document.readyState ===
    'loading'
) {

    document.addEventListener(
        'DOMContentLoaded',
        initApp,
        {
            once: true
        }
    );

} else {

    initApp();

}
```
