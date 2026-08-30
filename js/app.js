// =====================================================
// LIFE GAME
// APP.JS
// Главный контроллер приложения
// =====================================================

'use strict';


// =====================================================
// IMPORTS
// =====================================================

import {
    createDefaultState
} from './state.js';

import {
    loadState,
    loadExpenses,
    loadUI,
    saveAll
} from './storage.js';

import {
    num,
    clamp,
    fmt
} from './utils.js';

import {
    levelFromXP,
    xpForLevel
} from './xp.js';


// =====================================================
// GLOBAL STATE
// =====================================================

let state = null;
let expenses = [];
let ui = null;

let currentPage = 'home';


// =====================================================
// NORMALIZE STATE
// =====================================================

function normalizeState(data) {

    const defaults =
        createDefaultState();

    const result = data || defaults;


    if (!result.player) {
        result.player =
            defaults.player;
    }

    if (!result.categories) {
        result.categories =
            defaults.categories;
    }

    if (!result.simulator) {
        result.simulator =
            defaults.simulator;
    }

    if (!Array.isArray(result.quests)) {
        result.quests =
            defaults.quests;
    }


    const categories =
        Object.keys(
            defaults.categories
        );


    categories.forEach(
        function(category) {

            if (
                !result.categories[category]
            ) {

                result.categories[category] =
                    defaults.categories[category];

            }

        }
    );


    return result;

}


// =====================================================
// INITIALIZATION
// =====================================================

function init() {

    console.log(
        '🚀 LIFE GAME — new architecture'
    );


    // -----------------------------------------
    // LOAD
    // -----------------------------------------

    state =
        loadState(
            normalizeState
        );


    expenses =
        loadExpenses();


    ui =
        loadUI();


    if (!ui) {

        ui = {
            expensesCollapsed: false
        };

    }


    // -----------------------------------------
    // SAVE NORMALIZED DATA
    // -----------------------------------------

    save();


    // -----------------------------------------
    // MAIN UI
    // -----------------------------------------

    updateHomeUI();

    updatePlayerUI();

    setupNavigation();

    setupGlobalHandlers();

    setupQuest();


    console.log(
        '✅ LIFE GAME initialized'
    );

}


// =====================================================
// SAVE
// =====================================================

function save() {

    saveAll(
        state,
        expenses,
        ui
    );

}


// =====================================================
// HELPERS
// =====================================================

function getCategory(
    category
) {

    if (
        !state ||
        !state.categories
    ) {

        return null;

    }


    return state.categories[
        category
    ] || null;

}


// =====================================================
// PLAYER XP
// =====================================================

function updatePlayerUI() {

    if (!state || !state.player) {
        return;
    }


    const player =
        state.player;


    const xp =
        Math.max(
            0,
            num(player.xp)
        );


    const level =
        Math.max(
            1,
            num(player.level)
        );


    const currentLevelXP =
        xpForLevel(level);


    const nextLevelXP =
        xpForLevel(level + 1);


    const levelStart =
        currentLevelXP;


    const required =
        Math.max(
            1,
            nextLevelXP -
            levelStart
        );


    const progress =
        clamp(
            (
                xp -
                levelStart
            ) /
            required *
            100,
            0,
            100
        );


    const levelEl =
        document.getElementById(
            'playerLevel'
        );


    const xpEl =
        document.getElementById(
            'playerXP'
        );


    const fillEl =
        document.getElementById(
            'playerXPFill'
        );


    const nextEl =
        document.getElementById(
            'xpNext'
        );


    const rankEl =
        document.getElementById(
            'playerRank'
        );


    if (levelEl) {

        levelEl.textContent =
            'LVL ' + level;

    }


    if (xpEl) {

        xpEl.textContent =
            fmt(xp) + ' XP';

    }


    if (fillEl) {

        fillEl.style.width =
            progress + '%';

    }


    if (nextEl) {

        const remaining =
            Math.max(
                0,
                nextLevelXP - xp
            );


        nextEl.textContent =
            fmt(remaining) +
            ' XP TO NEXT LEVEL';

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
                    level / 3
                ),
                ranks.length - 1
            );


        rankEl.textContent =
            ranks[index];

    }

}


// =====================================================
// HOME UI
// =====================================================

function updateHomeUI() {

    if (!state) {
        return;
    }


    const finance =
        getCategory(
            'finance'
        );


    const health =
        getCategory(
            'health'
        );


    const development =
        getCategory(
            'development'
        );


    // -----------------------------------------
    // FINANCE
    // -----------------------------------------

    let financePercent = 0;


    if (
        window.LifeGameFinance &&
        typeof
            window.LifeGameFinance.progress ===
            'function'
    ) {

        financePercent =
            window.LifeGameFinance.progress(
                state,
                expenses
            );

    }


    // -----------------------------------------
    // HEALTH
    // -----------------------------------------

    let healthPercent = 0;


    if (health) {

        const routine =
            clamp(
                health.routine,
                0,
                100
            );


        const nutrition =
            clamp(
                health.nutrition,
                0,
                100
            );


        const steps =
            clamp(
                num(health.steps) /
                10000 *
                100,
                0,
                100
            );


        healthPercent =
            Math.round(
                (
                    routine +
                    nutrition +
                    steps
                ) / 3
            );

    }


    // -----------------------------------------
    // DEVELOPMENT
    // -----------------------------------------

    let developmentPercent = 0;


    if (
        window.LifeGameDevelopment &&
        typeof
            window.LifeGameDevelopment.progress ===
            'function'
    ) {

        developmentPercent =
            window.LifeGameDevelopment.progress(
                state
            );

    }
    else if (development) {

        const books =
            clamp(
                num(development.books) /
                2 *
                100,
                0,
                100
            );


        const language =
            clamp(
                num(
                    development.languageMinutes
                ) /
                30 *
                100,
                0,
                100
            );


        const meditation =
            clamp(
                num(
                    development.meditationMinutes
                ) /
                15 *
                100,
                0,
                100
            );


        developmentPercent =
            Math.round(
                (
                    books +
                    language +
                    meditation
                ) / 3
            );

    }


    // -----------------------------------------
    // FINANCE
    // -----------------------------------------

    const financeEl =
        document.getElementById(
            'financePercent'
        );


    const financeFill =
        document.getElementById(
            'financeFill'
        );


    if (financeEl) {

        financeEl.textContent =
            Math.round(
                financePercent
            ) + '%';

    }


    if (financeFill) {

        financeFill.style.width =
            clamp(
                financePercent,
                0,
                100
            ) + '%';

    }


    // -----------------------------------------
    // DEVELOPMENT
    // -----------------------------------------

    const developmentEl =
        document.getElementById(
            'developmentPercent'
        );


    const developmentFill =
        document.getElementById(
            'developmentFill'
        );


    if (developmentEl) {

        developmentEl.textContent =
            Math.round(
                developmentPercent
            ) + '%';

    }


    if (developmentFill) {

        developmentFill.style.width =
            clamp(
                developmentPercent,
                0,
                100
            ) + '%';

    }


    // -----------------------------------------
    // HEALTH
    // -----------------------------------------

    const healthEl =
        document.getElementById(
            'healthPercent'
        );


    const healthFill =
        document.getElementById(
            'healthFill'
        );


    if (healthEl) {

        healthEl.textContent =
            Math.round(
                healthPercent
            ) + '%';

    }


    if (healthFill) {

        healthFill.style.width =
            clamp(
                healthPercent,
                0,
                100
            ) + '%';

    }


    // -----------------------------------------
    // LIFE PROGRESS
    // -----------------------------------------

    const lifeProgress =
        Math.round(
            (
                financePercent +
                developmentPercent +
                healthPercent
            ) / 3
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
            clamp(
                lifeProgress,
                0,
                100
            ) +
            '<span>%</span>';

    }


    if (lifeFill) {

        lifeFill.style.width =
            clamp(
                lifeProgress,
                0,
                100
            ) + '%';

    }

}


// =====================================================
// NAVIGATION
// =====================================================

function setupNavigation() {

    const buttons =
        document.querySelectorAll(
            '.nav button[data-nav]'
        );


    buttons.forEach(
        function(button) {

            button.addEventListener(
                'click',
                function(event) {

                    event.preventDefault();

                    const page =
                        button.dataset.nav;


                    if (!page) {
                        return;
                    }


                    openPage(page);

                }
            );

        }
    );

}


// =====================================================
// OPEN PAGE
// =====================================================

function openPage(
    pageName
) {

    const creators = {

        home:
            createHomePage,

        finance:
            createFinancePage,

        health:
            createHealthPage,

        development:
            createDevelopmentPage

    };


    const creator =
        creators[pageName];


    if (
        typeof creator !==
        'function'
    ) {

        console.warn(
            'Unknown page:',
            pageName
        );

        return;

    }


    const oldPage =
        document.querySelector(
            '.page'
        );


    if (oldPage) {

        oldPage.remove();

    }


    const page =
        document.createElement(
            'div'
        );


    page.className =
        'page';


    page.innerHTML =
        creator();


    document.body.appendChild(
        page
    );


    currentPage =
        pageName;


    document.body.classList.add(
        'locked'
    );


    updateNavigation();


    setupPageHandlers(
        pageName
    );

}


// =====================================================
// CLOSE PAGE
// =====================================================

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


    updateNavigation();

    updateHomeUI();

    updatePlayerUI();

}


// =====================================================
// NAVIGATION ACTIVE STATE
// =====================================================

function updateNavigation() {

    document
        .querySelectorAll(
            '.nav button[data-nav]'
        )
        .forEach(
            function(button) {

                button.classList.toggle(
                    'active',
                    button.dataset.nav ===
                    currentPage
                );

            }
        );

}


// =====================================================
// HOME PAGE
// =====================================================

function createHomePage() {

    const finance =
        getCategory(
            'finance'
        );


    const health =
        getCategory(
            'health'
        );


    const development =
        getCategory(
            'development'
        );


    let financePercent = 0;


    if (
        window.LifeGameFinance &&
        typeof
            window.LifeGameFinance.progress ===
            'function'
    ) {

        financePercent =
            window.LifeGameFinance.progress(
                state,
                expenses
            );

    }


    let healthPercent = 0;


    if (health) {

        healthPercent =
            Math.round(
                (
                    clamp(
                        health.routine,
                        0,
                        100
                    ) +
                    clamp(
                        health.nutrition,
                        0,
                        100
                    ) +
                    clamp(
                        num(health.steps) /
                        10000 *
                        100,
                        0,
                        100
                    )
                ) / 3
            );

    }


    let developmentPercent = 0;


    if (
        window.LifeGameDevelopment &&
        typeof
            window.LifeGameDevelopment.progress ===
            'function'
    ) {

        developmentPercent =
            window.LifeGameDevelopment.progress(
                state
            );

    }


    const life =
        Math.round(
            (
                financePercent +
                healthPercent +
                developmentPercent
            ) / 3
        );


    return `

        <div class="page-inner">

            <div class="page-head">

                <button
                    class="back"
                    type="button"
                    data-close-page
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

                <div class="summary-number">
                    ${life}%
                </div>

                <div class="progress">

                    <i
                        style="
                            width:${life}%;
                        "
                    ></i>

                </div>

            </div>


            <div class="cards">

                ${homeMetric(
                    '❤️',
                    'Здоровье',
                    healthPercent
                )}

                ${homeMetric(
                    '💰',
                    'Финансы',
                    financePercent
                )}

                ${homeMetric(
                    '🧠',
                    'Развитие',
                    developmentPercent
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
    percent
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
                            ${Math.round(
                                percent
                            )}%
                        </span>

                    </div>

                </div>


                <div class="metric-percent">
                    ${Math.round(
                        percent
                    )}%
                </div>

            </div>


            <div class="metric-bar">

                <i
                    style="
                        width:${clamp(
                            percent,
                            0,
                            100
                        )}%;
                    "
                ></i>

            </div>

        </div>

    `;

}


// =====================================================
// FINANCE PAGE
// =====================================================

function createFinancePage() {

    if (
        !window.LifeGameFinance ||
        typeof
            window.LifeGameFinance.page !==
            'function'
    ) {

        return moduleUnavailable(
            'Финансовый модуль не загружен.'
        );

    }


    return `

        <div class="page-inner">

            <div class="page-head">

                <button
                    class="back"
                    type="button"
                    data-close-page
                >
                    ←
                </button>

                <h2>
                    Финансы
                </h2>

            </div>


            ${window.LifeGameFinance.page(
                state,
                expenses,
                ui
            )}

        </div>

    `;

}


// =====================================================
// HEALTH PAGE
// =====================================================

function createHealthPage() {

    if (
        window.LifeGameHealth &&
        typeof
            window.LifeGameHealth.page ===
            'function'
    ) {

        return `

            <div class="page-inner">

                <div class="page-head">

                    <button
                        class="back"
                        type="button"
                        data-close-page
                    >
                        ←
                    </button>

                    <h2>
                        Здоровье
                    </h2>

                </div>


                ${window.LifeGameHealth.page(
                    state,
                    {
                        metric,
                        fmt,
                        clamp,
                        esc,
                        creatorHTML
                    }
                )}

            </div>

        `;

    }


    return createFallbackHealthPage();

}


// =====================================================
// DEVELOPMENT PAGE
// =====================================================

function createDevelopmentPage() {

    if (
        window.LifeGameDevelopment &&
        typeof
            window.LifeGameDevelopment.page ===
            'function'
    ) {

        return `

            <div class="page-inner">

                <div class="page-head">

                    <button
                        class="back"
                        type="button"
                        data-close-page
                    >
                        ←
                    </button>

                    <h2>
                        Развитие
                    </h2>

                </div>


                ${window.LifeGameDevelopment.page(
                    state,
                    {
                        metric,
                        fmt,
                        clamp,
                        esc,
                        creatorHTML
                    }
                )}

            </div>

        `;

    }


    return createFallbackDevelopmentPage();

}


// =====================================================
// FALLBACK HEALTH
// =====================================================

function createFallbackHealthPage() {

    const health =
        getCategory(
            'health'
        ) || {};


    const routine =
        clamp(
            health.routine,
            0,
            100
        );


    const nutrition =
        clamp(
            health.nutrition,
            0,
            100
        );


    const steps =
        clamp(
            num(health.steps) /
            10000 *
            100,
            0,
            100
        );


    const progress =
        Math.round(
            (
                routine +
                nutrition +
                steps
            ) / 3
        );


    return `

        <div class="summary">

            <div class="section-label">
                HEALTH LEVEL
                ${num(health.level) || 1}
            </div>

            <div class="summary-number">
                ${progress}%
            </div>

            <div class="progress">

                <i
                    style="
                        width:${progress}%;
                    "
                ></i>

            </div>

        </div>


        <div class="cards">

            ${metric(
                '⏰',
                'Режим дня',
                routine + '%',
                '100%',
                routine,
                'healthRoutine'
            )}

            ${metric(
                '🍎',
                'Питание',
                nutrition + '%',
                '100%',
                nutrition,
                'healthNutrition'
            )}

            ${metric(
                '🚶',
                'Шаги',
                fmt(
                    num(health.steps)
                ),
                '10 000',
                steps,
                'healthSteps'
            )}

        </div>

    `;

}


// =====================================================
// FALLBACK DEVELOPMENT
// =====================================================

function createFallbackDevelopmentPage() {

    const development =
        getCategory(
            'development'
        ) || {};


    const books =
        clamp(
            num(development.books) /
            2 *
            100,
            0,
            100
        );


    const language =
        clamp(
            num(
                development.languageMinutes
            ) /
            30 *
            100,
            0,
            100
        );


    const meditation =
        clamp(
            num(
                development.meditationMinutes
            ) /
            15 *
            100,
            0,
            100
        );


    const progress =
        Math.round(
            (
                books +
                language +
                meditation
            ) / 3
        );


    return `

        <div class="summary">

            <div class="section-label">
                DEVELOPMENT LEVEL
                ${num(development.level) || 1}
            </div>

            <div class="summary-number">
                ${progress}%
            </div>

            <div class="progress">

                <i
                    style="
                        width:${progress}%;
                    "
                ></i>

            </div>

            <div class="finance-box">

                <div class="finance-line">

                    <span>
                        DEVELOPMENT XP
                    </span>

                    <strong>
                        ${fmt(
                            development.xp
                        )} XP
                    </strong>

                </div>

                <div class="finance-line">

                    <span>
                        STREAK
                    </span>

                    <strong>
                        🔥 ${num(
                            development.streak
                        )}
                    </strong>

                </div>

            </div>

        </div>


        <div class="cards">

            ${metric(
                '📚',
                'Книги',
                num(development.books),
                '2',
                books,
                'books'
            )}

            ${metric(
                '🌐',
                'Изучение языка',
                fmt(
                    development.languageMinutes
                ) + ' мин',
                '30 мин',
                language,
                'languageMinutes'
            )}

            ${metric(
                '🧘',
                'Медитация',
                fmt(
                    development.meditationMinutes
                ) + ' мин',
                '15 мин',
                meditation,
                'meditationMinutes'
            )}

        </div>

    `;

}


// =====================================================
// COMMON METRIC
// =====================================================

function metric(
    icon,
    title,
    current,
    target,
    percent,
    edit
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
                            ${escapeHTML(title)}
                        </strong>

                        <span>
                            ${escapeHTML(
                                current
                            )}
                            /
                            ${escapeHTML(
                                target
                            )}
                        </span>

                    </div>

                </div>


                <div class="metric-percent">
                    ${Math.round(
                        clamp(
                            percent,
                            0,
                            100
                        )
                    )}%
                </div>

            </div>


            <div class="metric-bar">

                <i
                    style="
                        width:${clamp(
                            percent,
                            0,
                            100
                        )}%;
                    "
                ></i>

            </div>


            ${
                edit
                    ? `

                        <button
                            class="edit"
                            type="button"
                            data-edit="${escapeHTML(
                                edit
                            )}"
                        >
                            ✎ ИЗМЕНИТЬ
                        </button>

                    `
                    : ''
            }

        </div>

    `;

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


    // -----------------------------------------
    // BACK
    // -----------------------------------------

    page.querySelectorAll(
        '[data-close-page]'
    ).forEach(
        function(button) {

            button.addEventListener(
                'click',
                closePage
            );

        }
    );


    // -----------------------------------------
    // FINANCE
    // -----------------------------------------

    if (
        pageName === 'finance'
    ) {

        setupFinanceHandlers(
            page
        );

    }


    // -----------------------------------------
    // HEALTH
    // -----------------------------------------

    if (
        pageName === 'health'
    ) {

        setupHealthHandlers(
            page
        );

    }


    // -----------------------------------------
    // DEVELOPMENT
    // -----------------------------------------

    if (
        pageName === 'development'
    ) {

        setupDevelopmentHandlers(
            page
        );

    }


    // -----------------------------------------
    // GENERIC EDIT
    // -----------------------------------------

    page.querySelectorAll(
        '[data-edit]'
    ).forEach(
        function(button) {

            button.addEventListener(
                'click',
                function(event) {

                    event.preventDefault();

                    event.stopPropagation();


                    const id =
                        button.dataset.edit;


                    handleEdit(
                        id
                    );

                }
            );

        }
    );

}


// =====================================================
// FINANCE HANDLERS
// =====================================================

function setupFinanceHandlers(
    page
) {

    const addExpense =
        page.querySelector(
            '#addExpense'
        );


    if (addExpense) {

        addExpense.addEventListener(
            'click',
            function() {

                openExpenseModal();

            }
        );

    }


    const toggle =
        page.querySelector(
            '#expensesToggle'
        );


    if (toggle) {

        toggle.addEventListener(
            'click',
            function() {

                ui.expensesCollapsed =
                    !ui.expensesCollapsed;


                save();


                refreshCurrentPage();

            }
        );

    }


    page.querySelectorAll(
        '.expense-edit'
    ).forEach(
        function(button) {

            button.addEventListener(
                'click',
                function(event) {

                    event.preventDefault();

                    event.stopPropagation();


                    openExpenseModal(
                        button.dataset.id
                    );

                }
            );

        }
    );


    setupExpenseSwipe(
        page
    );

}


// =====================================================
// EXPENSE SWIPE
// =====================================================

function setupExpenseSwipe(
    page
) {

    const wrappers =
        page.querySelectorAll(
            '.expense-swipe'
        );


    wrappers.forEach(
        function(wrapper) {

            const expense =
                wrapper.querySelector(
                    '.expense'
                );


            if (!expense) {
                return;
            }


            let startX = 0;
            let startY = 0;
            let currentX = 0;
            let tracking = false;


            expense.addEventListener(
                'touchstart',
                function(event) {

                    const touch =
                        event.touches[0];


                    startX =
                        touch.clientX;

                    startY =
                        touch.clientY;

                    currentX =
                        startX;

                    tracking =
                        true;

                },
                {
                    passive: true
                }
            );


            expense.addEventListener(
                'touchmove',
                function(event) {

                    if (!tracking) {
                        return;
                    }


                    const touch =
                        event.touches[0];


                    currentX =
                        touch.clientX;


                    const dx =
                        currentX -
                        startX;


                    const dy =
                        touch.clientY -
                        startY;


                    if (
                        Math.abs(dy) >
                        Math.abs(dx)
                    ) {

                        return;

                    }


                    if (dx < 0) {

                        const distance =
                            Math.max(
                                -76,
                                dx
                            );


                        expense.style.transition =
                            'none';


                        expense.style.transform =
                            `translateX(${distance}px)`;

                    }

                },
                {
                    passive: true
                }
            );


            expense.addEventListener(
                'touchend',
                function() {

                    if (!tracking) {
                        return;
                    }


                    tracking =
                        false;


                    const dx =
                        currentX -
                        startX;


                    expense.style.transition =
                        'transform .2s ease';


                    if (dx < -45) {

                        expense.classList.add(
                            'swiped'
                        );

                    }
                    else {

                        expense.classList.remove(
                            'swiped'
                        );

                        expense.style.transform =
                            '';

                    }


                    if (dx < -120) {

                        const id =
                            wrapper.dataset.id;


                        setTimeout(
                            function() {

                                deleteExpense(
                                    id
                                );

                            },
                            120
                        );

                    }

                }
            );

        }
    );

}


// =====================================================
// HEALTH HANDLERS
// =====================================================

function setupHealthHandlers(
    page
) {

    page.querySelectorAll(
        '[data-health-action]'
    ).forEach(
        function(button) {

            button.addEventListener(
                'click',
                function() {

                    const action =
                        button.dataset.healthAction;


                    if (
                        action ===
                        'workout' &&
                        typeof
                            window.completeWorkout ===
                            'function'
                    ) {

                        window.completeWorkout();

                        refreshCurrentPage();

                    }

                }
            );

        }
    );

}


// =====================================================
// DEVELOPMENT HANDLERS
// =====================================================

function setupDevelopmentHandlers(
    page
) {

    page.querySelectorAll(
        '[data-development-action]'
    ).forEach(
        function(button) {

            button.addEventListener(
                'click',
                function() {

                    const action =
                        button.dataset
                            .developmentAction;


                    if (
                        action === 'book'
                    ) {

                        addDevelopmentXP(
                            10
                        );

                    }


                    refreshCurrentPage();

                }
            );

        }
    );

}


// =====================================================
// GENERIC EDIT
// =====================================================

function handleEdit(
    id
) {

    if (!id) {
        return;
    }


    // -----------------------------------------
    // FINANCE
    // -----------------------------------------

    if (
        id === 'income'
    ) {

        editFinanceValue(
            'monthlyIncome',
            'Введите доход за месяц:'
        );

        return;

    }


    if (
        id === 'yearlyGoal'
    ) {

        editFinanceValue(
            'yearlyGoal',
            'Введите цель на год:'
        );

        return;

    }


    if (
        id === 'savings'
    ) {

        editFinanceValue(
            'savings',
            'Введите сумму накоплений:'
        );

        return;

    }


    // -----------------------------------------
    // DEVELOPMENT
    // -----------------------------------------

    if (
        id === 'books'
    ) {

        editDevelopmentValue(
            'books',
            'Введите количество книг:'
        );

        return;

    }


    if (
        id === 'languageMinutes'
    ) {

        editDevelopmentValue(
            'languageMinutes',
            'Введите минуты изучения языка:'
        );

        return;

    }


    if (
        id === 'meditationMinutes'
    ) {

        editDevelopmentValue(
            'meditationMinutes',
            'Введите минуты медитации:'
        );

        return;

    }


    // -----------------------------------------
    // HEALTH
    // -----------------------------------------

    if (
        id === 'healthRoutine'
    ) {

        editHealthValue(
            'routine',
            'Введите процент режима дня (0-100):'
        );

        return;

    }


    if (
        id === 'healthNutrition'
    ) {

        editHealthValue(
            'nutrition',
            'Введите процент питания (0-100):'
        );

        return;

    }


    if (
        id === 'healthSteps'
    ) {

        editHealthValue(
            'steps',
            'Введите количество шагов:'
        );

        return;

    }


    console.warn(
        'Unknown edit:',
        id
    );

}


// =====================================================
// FINANCE EDIT
// =====================================================

function editFinanceValue(
    key,
    message
) {

    const finance =
        getCategory(
            'finance'
        );


    if (!finance) {
        return;
    }


    const current =
        num(
            finance[key]
        );


    const value =
        prompt(
            message,
            String(current)
        );


    if (
        value === null ||
        value.trim() === ''
    ) {

        return;

    }


    const number =
        Number(
            value.replace(
                /\s/g,
                ''
            ).replace(
                ',',
                '.'
            )
        );


    if (
        !Number.isFinite(number) ||
        number < 0
    ) {

        showToast(
            '⚠️ Введите корректное число'
        );

        return;

    }


    finance[key] =
        number;


    // -----------------------------------------
    // XP
    // -----------------------------------------

    finance.xp =
        num(finance.xp) + 5;


    finance.level =
        levelFromXP(
            finance.xp
        );


    save();


    showToast(
        '💾 Финансовые данные обновлены'
    );


    updateHomeUI();

    updatePlayerUI();

    refreshCurrentPage();

}


// =====================================================
// EXPENSE MODAL
// =====================================================

function openExpenseModal(
    id = null
) {

    const existing =
        id
            ? expenses.find(
                function(expense) {
                    return String(
                        expense.id
                    ) === String(id);
                }
            )
            : null;


    const name =
        prompt(
            'Название обязательного расхода:',
            existing
                ? existing.name
                : ''
        );


    if (
        name === null
    ) {

        return;

    }


    const cleanName =
        name.trim();


    if (!cleanName) {

        showToast(
            '⚠️ Укажите название расхода'
        );

        return;

    }


    const amountInput =
        prompt(
            'Сумма обязательного расхода:',
            existing
                ? String(
                    existing.amount
                )
                : ''
        );


    if (
        amountInput === null
    ) {

        return;

    }


    const amount =
        Number(
            amountInput
                .replace(
                    /\s/g,
                    ''
                )
                .replace(
                    ',',
                    '.'
                )
        );


    if (
        !Number.isFinite(amount) ||
        amount <= 0
    ) {

        showToast(
            '⚠️ Укажите корректную сумму'
        );

        return;

    }


    if (existing) {

        existing.name =
            cleanName;

        existing.amount =
            amount;


        showToast(
            '✎ Расход изменён'
        );

    }
    else {

        expenses.push({

            id:
                String(
                    Date.now()
                ) +
                Math.random()
                    .toString(36)
                    .slice(2),

            name:
                cleanName,

            amount:
                amount

        });


        showToast(
            '💳 Расход добавлен'
        );

    }


    const finance =
        getCategory(
            'finance'
        );


    if (finance) {

        finance.xp =
            num(finance.xp) + 5;

        finance.level =
            levelFromXP(
                finance.xp
            );

    }


    save();


    updateHomeUI();

    updatePlayerUI();

    refreshCurrentPage();

}


// =====================================================
// DELETE EXPENSE
// =====================================================

function deleteExpense(
    id
) {

    const index =
        expenses.findIndex(
            function(expense) {

                return String(
                    expense.id
                ) === String(id);

            }
        );


    if (
        index === -1
    ) {

        return;

    }


    expenses.splice(
        index,
        1
    );


    save();


    showToast(
        '🗑 Расход удалён'
    );


    updateHomeUI();

    updatePlayerUI();

    refreshCurrentPage();

}


// =====================================================
// DEVELOPMENT EDIT
// =====================================================

function editDevelopmentValue(
    key,
    message
) {

    const development =
        getCategory(
            'development'
        );


    if (!development) {
        return;
    }


    const current =
        num(
            development[key]
        );


    const value =
        prompt(
            message,
            String(current)
        );


    if (
        value === null
    ) {

        return;

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
            '⚠️ Введите корректное число'
        );

        return;

    }


    development[key] =
        number;


    development.xp =
        num(
            development.xp
        ) + 5;


    development.level =
        levelFromXP(
            development.xp
        );


    save();


    showToast(
        '🧠 Развитие обновлено'
    );


    updateHomeUI();

    updatePlayerUI();

    refreshCurrentPage();

}


// =====================================================
// HEALTH EDIT
// =====================================================

function editHealthValue(
    key,
    message
) {

    const health =
        getCategory(
            'health'
        );


    if (!health) {
        return;
    }


    const current =
        num(
            health[key]
        );


    const value =
        prompt(
            message,
            String(current)
        );


    if (
        value === null
    ) {

        return;

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
            '⚠️ Введите корректное число'
        );

        return;

    }


    if (
        key === 'routine' ||
        key === 'nutrition'
    ) {

        health[key] =
            clamp(
                number,
                0,
                100
            );

    }
    else {

        health[key] =
            clamp(
                number,
                0,
                100000
            );

    }


    health.xp =
        num(
            health.xp
        ) + 5;


    health.level =
        levelFromXP(
            health.xp
        );


    save();


    showToast(
        '❤️ Данные здоровья обновлены'
    );


    updateHomeUI();

    updatePlayerUI();

    refreshCurrentPage();

}


// =====================================================
// DEVELOPMENT XP
// =====================================================

function addDevelopmentXP(
    amount
) {

    const development =
        getCategory(
            'development'
        );


    if (!development) {
        return;
    }


    development.xp =
        num(
            development.xp
        ) +
        num(amount);


    development.level =
        levelFromXP(
            development.xp
        );


    save();


    updateHomeUI();

    updatePlayerUI();

}


// =====================================================
// QUEST
// =====================================================

function setupQuest() {

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
// DAILY QUEST
// =====================================================

function completeDailyQuest() {

    const button =
        document.getElementById(
            'dailyQuest'
        );


    if (
        !button ||
        button.disabled
    ) {

        return;

    }


    const quests =
        Array.isArray(
            state.quests
        )
            ? state.quests
            : [];


    const available =
        quests.find(
            function(quest) {

                return !quest.done;

            }
        );


    if (!available) {

        showToast(
            '✅ Все квесты выполнены'
        );

        return;

    }


    available.done =
        true;


    const reward =
        num(
            available.xp
        );


    state.player.xp =
        num(
            state.player.xp
        ) +
        reward;


    state.player.level =
        levelFromXP(
            state.player.xp
        );


    const category =
        getCategory(
            available.category
        );


    if (category) {

        category.xp =
            num(category.xp) +
            reward;


        category.level =
            levelFromXP(
                category.xp
            );

    }


    save();


    showToast(
        '⚡ Квест выполнен! +' +
        reward +
        ' XP'
    );


    button.textContent =
        '✅ QUEST COMPLETED';


    button.disabled =
        true;


    button.style.opacity =
        '0.5';


    updateHomeUI();

    updatePlayerUI();


    setTimeout(
        function() {

            resetDailyQuestButton();

        },
        30000
    );

}


// =====================================================
// QUEST RESET UI
// =====================================================

function resetDailyQuestButton() {

    const button =
        document.getElementById(
            'dailyQuest'
        );


    if (!button) {
        return;
    }


    button.textContent =
        '⚡ DAILY QUEST';


    button.disabled =
        false;


    button.style.opacity =
        '1';

}


// =====================================================
// GLOBAL HANDLERS
// =====================================================

function setupGlobalHandlers() {

    // -----------------------------------------
    // ESC
    // -----------------------------------------

    document.addEventListener(
        'keydown',
        function(event) {

            if (
                event.key ===
                'Escape'
            ) {

                const overlay =
                    document.querySelector(
                        '.overlay'
                    );


                if (overlay) {

                    overlay.remove();

                    return;

                }


                closePage();

            }

        }
    );


    // -----------------------------------------
    // OUTSIDE PAGE
    // -----------------------------------------

    document.addEventListener(
        'click',
        function(event) {

            if (
                event.target.classList.contains(
                    'page'
                )
            ) {

                closePage();

            }

        }
    );

}


// =====================================================
// REFRESH CURRENT PAGE
// =====================================================

function refreshCurrentPage() {

    if (
        currentPage ===
        'home'
    ) {

        updateHomeUI();

        updatePlayerUI();

        return;

    }


    openPage(
        currentPage
    );

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
            <strong>
                &nbsp;@shkeltinsh
            </strong>
        </a>

    `;

}


// =====================================================
// ESCAPE HTML
// =====================================================

function escapeHTML(
    value
) {

    return String(
        value === undefined ||
        value === null
            ? ''
            : value
    ).replace(
        /[&<>"']/g,
        function(character) {

            return {

                '&':
                    '&amp;',

                '<':
                    '&lt;',

                '>':
                    '&gt;',

                '"':
                    '&quot;',

                "'":
                    '&#039;'

            }[character];

        }
    );

}


// =====================================================
// MODULE UNAVAILABLE
// =====================================================

function moduleUnavailable(
    message
) {

    return `

        <div class="notice">

            ⚠️
            ${escapeHTML(
                message
            )}

        </div>

    `;

}


// =====================================================
// TOAST
// =====================================================

function showToast(
    message
) {

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
        message;


    toast.classList.add(
        'show'
    );


    clearTimeout(
        toast._timer
    );


    toast._timer =
        setTimeout(
            function() {

                toast.classList.remove(
                    'show'
                );

            },
            2500
        );

}


// =====================================================
// GLOBAL API
// =====================================================

window.LifeGameApp = {

    getState:
        function() {
            return state;
        },

    getExpenses:
        function() {
            return expenses;
        },

    getUI:
        function() {
            return ui;
        },

    save:
        save,

    openPage:
        openPage,

    closePage:
        closePage,

    refresh:
        refreshCurrentPage,

    updateHomeUI:
        updateHomeUI,

    updatePlayerUI:
        updatePlayerUI

};


window.openPage =
    openPage;


window.closePage =
    closePage;


window.showToast =
    showToast;


// =====================================================
// START
// =====================================================

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