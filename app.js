```javascript
/* =========================================
   LIFE GAME
   Interactive MVP
   ========================================= */

const STORAGE_KEY = "lifeGameData";


// =========================================
// DEFAULT DATA
// =========================================

const defaultData = {

    level: 1,

    xp: 0,

    categories: {

        finance: {

            title: "Финансы",
            icon: "💰",

            metrics: [

                {
                    id: "monthly_income",
                    name: "Заработано за месяц",
                    icon: "💵",
                    unit: "₽",
                    current: 10000,
                    target: 100000
                },

                {
                    id: "monthly_goal",
                    name: "Цель на месяц",
                    icon: "🎯",
                    unit: "₽",
                    current: 0,
                    target: 100000
                },

                {
                    id: "yearly_goal",
                    name: "Цель на год",
                    icon: "🏆",
                    unit: "₽",
                    current: 0,
                    target: 1200000
                },

                {
                    id: "mandatory_expenses",
                    name: "Обязательные расходы",
                    icon: "📉",
                    unit: "₽",
                    current: 0,
                    target: 50000
                },

                {
                    id: "safety_cushion",
                    name: "Подушка безопасности",
                    icon: "🛡️",
                    unit: "₽",
                    current: 0,
                    target: 300000
                }

            ]

        },


        health: {

            title: "Здоровье",
            icon: "❤️",

            metrics: [

                {
                    id: "daily_routine",
                    name: "Режим дня",
                    icon: "⏰",
                    unit: "%",
                    current: 0,
                    target: 100
                },

                {
                    id: "nutrition",
                    name: "Питание КБЖУ",
                    icon: "🍎",
                    unit: "%",
                    current: 0,
                    target: 100
                },

                {
                    id: "workouts",
                    name: "Программа тренировок",
                    icon: "🏋️",
                    unit: "тренировок",
                    current: 0,
                    target: 12
                },

                {
                    id: "daily_steps",
                    name: "Шаги в день",
                    icon: "🚶",
                    unit: "шагов",
                    current: 0,
                    target: 10000
                }

            ]

        },


        development: {

            title: "Развитие",
            icon: "🧠",

            metrics: [

                {
                    id: "books",
                    name: "Чтение книг",
                    icon: "📚",
                    unit: "книг",
                    current: 0,
                    target: 2
                },

                {
                    id: "language",
                    name: "Изучение языка",
                    icon: "🌐",
                    unit: "минут",
                    current: 0,
                    target: 30
                },

                {
                    id: "meditation",
                    name: "Медитация",
                    icon: "🧘",
                    unit: "минут",
                    current: 0,
                    target: 15
                }

            ]

        }

    }

};


// =========================================
// APPLICATION STATE
// =========================================

let lifeData = loadData();


// =========================================
// START
// =========================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        renderHome();

        initializeNavigation();

        initializeQuest();

    }
);


// =========================================
// STORAGE
// =========================================

function loadData() {

    try {

        const saved =
            localStorage.getItem(
                STORAGE_KEY
            );

        if (saved) {

            return JSON.parse(saved);

        }

    } catch (error) {

        console.error(
            "Storage error:",
            error
        );

    }

    return structuredClone(
        defaultData
    );

}


function saveData() {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(lifeData)
    );

}


// =========================================
// PROGRESS
// =========================================

function calculateProgress(
    current,
    target
) {

    current =
        Number(current) || 0;

    target =
        Number(target) || 0;

    if (target <= 0) {

        return 0;

    }

    return Math.min(
        Math.round(
            (current / target) * 100
        ),
        100
    );

}


// =========================================
// CATEGORY PROGRESS
// =========================================

function calculateCategoryProgress(
    category
) {

    const metrics =
        lifeData.categories[
            category
        ].metrics;


    if (!metrics.length) {

        return 0;

    }


    const total =
        metrics.reduce(
            (
                sum,
                metric
            ) => {

                return sum +
                    calculateProgress(
                        metric.current,
                        metric.target
                    );

            },
            0
        );


    return Math.round(
        total / metrics.length
    );

}


// =========================================
// OVERALL PROGRESS
// =========================================

function calculateOverallProgress() {

    const finance =
        calculateCategoryProgress(
            "finance"
        );

    const health =
        calculateCategoryProgress(
            "health"
        );

    const development =
        calculateCategoryProgress(
            "development"
        );


    return Math.round(
        (
            finance +
            health +
            development
        ) / 3
    );

}


// =========================================
// HOME
// =========================================

function renderHome() {

    renderLevel();

    renderOverall();

    renderCategories();

}


// =========================================
// LEVEL
// =========================================

function renderLevel() {

    const level =
        document.querySelector(
            ".level-number"
        );

    const xp =
        document.querySelector(
            ".xp-value"
        );

    const xpFill =
        document.querySelector(
            ".xp-fill"
        );


    if (level) {

        level.textContent =
            `LVL ${lifeData.level}`;

    }


    if (xp) {

        xp.textContent =
            `${lifeData.xp} XP`;

    }


    if (xpFill) {

        const xpTarget = 1000;

        const progress =
            Math.min(
                (
                    lifeData.xp /
                    xpTarget
                ) * 100,
                100
            );

        xpFill.style.width =
            `${progress}%`;

    }

}


// =========================================
// OVERALL
// =========================================

function renderOverall() {

    const progress =
        calculateOverallProgress();


    const value =
        document.querySelector(
            ".overall-value"
        );

    const bar =
        document.querySelector(
            ".overall-fill"
        );


    if (value) {

        value.innerHTML =
            `${progress}<span>%</span>`;

    }


    if (bar) {

        setTimeout(
            () => {

                bar.style.width =
                    `${progress}%`;

            },
            100
        );

    }

}


// =========================================
// CATEGORY CARDS
// =========================================

function renderCategories() {

    Object.keys(
        lifeData.categories
    ).forEach(
        category => {

            const progress =
                calculateCategoryProgress(
                    category
                );


            const card =
                document.querySelector(
                    `[data-category="${category}"]`
                );


            if (!card) {

                return;

            }


            const percent =
                card.querySelector(
                    ".category-percent"
                );

            const fill =
                card.querySelector(
                    ".progress-fill"
                );


            if (percent) {

                percent.textContent =
                    `${progress}%`;

            }


            if (fill) {

                setTimeout(
                    () => {

                        fill.style.width =
                            `${progress}%`;

                    },
                    150
                );

            }

        }
    );

}


// =========================================
// NAVIGATION
// =========================================

function initializeNavigation() {

    const navItems =
        document.querySelectorAll(
            ".nav-item"
        );


    navItems.forEach(
        item => {

            item.addEventListener(
                "click",
                () => {

                    const section =
                        item.dataset.section;


                    if (!section) {

                        renderHome();

                        setActiveNavigation(
                            item
                        );

                        return;

                    }


                    setActiveNavigation(
                        item
                    );


                    renderCategoryPage(
                        section
                    );

                }
            );

        }
    );


    const categoryCards =
        document.querySelectorAll(
            ".category-card"
        );


    categoryCards.forEach(
        card => {

            card.addEventListener(
                "click",
                () => {

                    const category =
                        card.dataset.category;


                    renderCategoryPage(
                        category
                    );

                }
            );

        }
    );

}


// =========================================
// ACTIVE NAV
// =========================================

function setActiveNavigation(
    activeItem
) {

    document
        .querySelectorAll(
            ".nav-item"
        )
        .forEach(
            item => {

                item.classList.remove(
                    "active"
                );

            }
        );


    activeItem.classList.add(
        "active"
    );

}


// =========================================
// CATEGORY PAGE
// =========================================

function renderCategoryPage(
    category
) {

    const data =
        lifeData.categories[
            category
        ];


    if (!data) {

        return;

    }


    const progress =
        calculateCategoryProgress(
            category
        );


    const metricsHTML =
        data.metrics
            .map(
                metric =>
                    createMetricHTML(
                        metric
                    )
            )
            .join("");


    const page =
        document.createElement(
            "div"
        );


    page.className =
        "category-page";


    page.innerHTML = `

        <div class="category-page-header">

            <button
                class="back-button"
                type="button"
            >
                ←
            </button>

            <div>

                <div class="page-eyebrow">
                    LIFE GAME
                </div>

                <h2>
                    ${data.icon}
                    ${data.title}
                </h2>

            </div>

        </div>


        <div class="category-summary">

            <div class="summary-label">
                CATEGORY PROGRESS
            </div>

            <div class="summary-value">
                ${progress}%
            </div>

            <div class="summary-bar">
                <div
                    class="summary-fill"
                    style="width:${progress}%"
                ></div>
            </div>

        </div>


        <div class="metrics-list">

            ${metricsHTML}

        </div>

    `;


    document
        .querySelector(".app")
        .appendChild(page);


    document.body.classList.add(
        "page-open"
    );


    page
        .querySelector(".back-button")
        .addEventListener(
            "click",
            () => {

                page.remove();

                document.body.classList.remove(
                    "page-open"
                );

                renderHome();

                setActiveNavigation(
                    document.querySelector(
                        ".nav-item:first-child"
                    )
                );

            }
        );


    page
        .querySelectorAll(
            ".metric-edit"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        const metricId =
                            button.dataset.metric;

                        openMetricEditor(
                            category,
                            metricId,
                            page
                        );

                    }
                );

            }
        );

}


// =========================================
// METRIC HTML
// =========================================

function createMetricHTML(
    metric
) {

    const progress =
        calculateProgress(
            metric.current,
            metric.target
        );


    return `

        <div class="metric-card">

            <div class="metric-top">

                <div class="metric-title">

                    <div class="metric-icon">
                        ${metric.icon}
                    </div>

                    <div>

                        <strong>
                            ${metric.name}
                        </strong>

                        <span>
                            ${formatNumber(metric.current)}
                            ${metric.unit}
                            /
                            ${formatNumber(metric.target)}
                            ${metric.unit}
                        </span>

                    </div>

                </div>


                <div class="metric-percent">
                    ${progress}%
                </div>

            </div>


            <div class="metric-progress">

                <div
                    class="metric-progress-fill"
                    style="width:${progress}%"
                ></div>

            </div>


            <button
                class="metric-edit"
                type="button"
                data-metric="${metric.id}"
            >
                ✎ ИЗМЕНИТЬ
            </button>

        </div>

    `;

}


// =========================================
// METRIC EDITOR
// =========================================

function openMetricEditor(
    category,
    metricId,
    page
) {

    const metric =
        lifeData.categories[
            category
        ].metrics.find(
            item =>
                item.id === metricId
        );


    if (!metric) {

        return;

    }


    const overlay =
        document.createElement(
            "div"
        );


    overlay.className =
        "editor-overlay";


    overlay.innerHTML = `

        <div class="editor">

            <button
                class="editor-close"
                type="button"
            >
                ×
            </button>


            <div class="editor-icon">
                ${metric.icon}
            </div>


            <div class="editor-eyebrow">
                EDIT GOAL
            </div>


            <h3>
                ${metric.name}
            </h3>


            <label>
                Текущее значение
            </label>

            <input
                id="currentValue"
                type="number"
                inputmode="decimal"
                value="${metric.current}"
            >


            <label>
                Цель
            </label>

            <input
                id="targetValue"
                type="number"
                inputmode="decimal"
                value="${metric.target}"
            >


            <div class="editor-preview">

                <span>
                    Новый прогресс
                </span>

                <strong id="editorProgress">
                    ${calculateProgress(
                        metric.current,
                        metric.target
                    )}%
                </strong>

            </div>


            <button
                class="save-button"
                type="button"
            >
                СОХРАНИТЬ
            </button>

        </div>

    `;


    document.body.appendChild(
        overlay
    );


    const currentInput =
        overlay.querySelector(
            "#currentValue"
        );

    const targetInput =
        overlay.querySelector(
            "#targetValue"
        );

    const progressElement =
        overlay.querySelector(
            "#editorProgress"
        );


    function updatePreview() {

        const current =
            Number(
                currentInput.value
            ) || 0;

        const target =
            Number(
                targetInput.value
            ) || 0;


        progressElement.textContent =
            `${calculateProgress(
                current,
                target
            )}%`;

    }


    currentInput.addEventListener(
        "input",
        updatePreview
    );


    targetInput.addEventListener(
        "input",
        updatePreview
    );


    overlay
        .querySelector(
            ".editor-close"
        )
        .addEventListener(
            "click",
            () => {

                overlay.remove();

            }
        );


    overlay.addEventListener(
        "click",
        event => {

            if (
                event.target === overlay
            ) {

                overlay.remove();

            }

        }
    );


    overlay
        .querySelector(
            ".save-button"
        )
        .addEventListener(
            "click",
            () => {

                metric.current =
                    Number(
                        currentInput.value
                    ) || 0;

                metric.target =
                    Number(
                        targetInput.value
                    ) || 0;


                saveData();


                overlay.remove();


                page.remove();

                document.body.classList.remove(
                    "page-open"
                );


                renderCategoryPage(
                    category
                );


                showMessage(
                    "Цель сохранена"
                );

            }
        );

}


// =========================================
// QUEST
// =========================================

function initializeQuest() {

    const button =
        document.querySelector(
            ".quest-button"
        );


    if (!button) {

        return;

    }


    button.addEventListener(
        "click",
        () => {

            showMessage(
                "Daily Quest появится здесь"
            );

        }
    );

}


// =========================================
// NUMBER FORMAT
// =========================================

function formatNumber(
    value
) {

    return new Intl.NumberFormat(
        "ru-RU"
    ).format(
        Number(value) || 0
    );

}


// =========================================
// MESSAGE
// =========================================

function showMessage(
    message
) {

    const existing =
        document.querySelector(
            ".life-message"
        );


    if (existing) {

        existing.remove();

    }


    const element =
        document.createElement(
            "div"
        );


    element.className =
        "life-message";


    element.textContent =
        message;


    document.body.appendChild(
        element
    );


    requestAnimationFrame(
        () => {

            element.classList.add(
                "show"
            );

        }
    );


    setTimeout(
        () => {

            element.classList.remove(
                "show"
            );


            setTimeout(
                () => {

                    element.remove();

                },
                200
            );

        },
        1800
    );

}
```
