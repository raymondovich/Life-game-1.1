<\> JavaScript

const STORAGE_KEY = "life_game_data_v1";

const DEFAULT_DATA = {
    finance: [
        ["monthly_income", "💵", "Заработано за месяц", "₽", 10000, 100000],
        ["monthly_goal", "🎯", "Цель на месяц", "₽", 0, 100000],
        ["yearly_goal", "🏆", "Цель на год", "₽", 0, 1200000],
        ["mandatory_expenses", "📉", "Обязательные расходы", "₽", 0, 50000],
        ["safety_cushion", "🛡️", "Подушка безопасности", "₽", 0, 300000]
    ],

    health: [
        ["daily_routine", "⏰", "Режим дня", "%", 0, 100],
        ["nutrition", "🍎", "Питание КБЖУ", "%", 0, 100],
        ["workouts", "🏋️", "Программа тренировок", "тренировок", 0, 12],
        ["daily_steps", "🚶", "Шаги в день", "шагов", 0, 10000]
    ],

    development: [
        ["books", "📚", "Чтение книг", "книг", 0, 2],
        ["language", "🌐", "Изучение языка", "минут", 0, 30],
        ["meditation", "🧘", "Медитация", "минут", 0, 15]
    ]
};


let data = loadData();


// ========================================
// START
// ========================================

document.addEventListener("DOMContentLoaded", init);


function init() {

    console.log("LIFE GAME: JavaScript loaded");

    bindNavigation();
    bindCategoryCards();
    bindQuest();

    renderHome();

}


// ========================================
// DATA
// ========================================

function loadData() {

    try {

        const saved = localStorage.getItem(STORAGE_KEY);

        if (saved) {
            return JSON.parse(saved);
        }

    } catch (error) {

        console.error("LIFE GAME storage error:", error);

    }

    return createDefaultData();
}


function createDefaultData() {

    const result = {};

    Object.keys(DEFAULT_DATA).forEach(category => {

        result[category] = DEFAULT_DATA[category].map(item => {

            return {
                id: item[0],
                icon: item[1],
                name: item[2],
                unit: item[3],
                current: item[4],
                target: item[5]
            };

        });

    });

    return result;
}


function saveData() {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(data)
    );

}


// ========================================
// PROGRESS
// ========================================

function progress(current, target) {

    current = Number(current) || 0;
    target = Number(target) || 0;

    if (target <= 0) {
        return 0;
    }

    return Math.min(
        Math.round((current / target) * 100),
        100
    );

}


function categoryProgress(category) {

    const items = data[category];

    if (!items || items.length === 0) {
        return 0;
    }

    const total = items.reduce((sum, item) => {

        return sum + progress(
            item.current,
            item.target
        );

    }, 0);

    return Math.round(total / items.length);

}


function overallProgress() {

    return Math.round(
        (
            categoryProgress("finance") +
            categoryProgress("health") +
            categoryProgress("development")
        ) / 3
    );

}


// ========================================
// HOME
// ========================================

function renderHome() {

    const app = document.querySelector(".app");

    if (!app) {
        console.error("LIFE GAME: .app not found");
        return;
    }


    // Update overall progress

    const overall = overallProgress();

    const overallValue =
        document.querySelector(".overall-value");

    const overallFill =
        document.querySelector(".overall-fill");


    if (overallValue) {

        overallValue.innerHTML =
            `${overall}<span>%</span>`;

    }


    if (overallFill) {

        overallFill.style.width =
            `${overall}%`;

    }


    // Update categories

    ["finance", "health", "development"].forEach(category => {

        const card =
            document.querySelector(
                `[data-category="${category}"]`
            );

        if (!card) {
            return;
        }


        const percent =
            categoryProgress(category);


        const percentElement =
            card.querySelector(".category-percent");


        const fill =
            card.querySelector(".progress-fill");


        if (percentElement) {

            percentElement.textContent =
                `${percent}%`;

        }


        if (fill) {

            fill.style.width =
                `${percent}%`;

        }

    });

}


// ========================================
// NAVIGATION
// ========================================

function bindNavigation() {

    const buttons =
        document.querySelectorAll(".nav-item");


    console.log(
        "LIFE GAME: navigation buttons:",
        buttons.length
    );


    buttons.forEach(button => {

        button.addEventListener("click", function(event) {

            event.preventDefault();
            event.stopPropagation();


            const section =
                this.dataset.section;


            console.log(
                "LIFE GAME navigation:",
                section || "home"
            );


            buttons.forEach(item => {

                item.classList.remove("active");

            });


            this.classList.add("active");


            if (!section) {

                closePage();
                renderHome();

                return;

            }


            openCategory(section);

        });

    });

}


// ========================================
// CATEGORY CARDS
// ========================================

function bindCategoryCards() {

    const cards =
        document.querySelectorAll(".category-card");


    cards.forEach(card => {

        card.addEventListener("click", function() {

            const category =
                this.dataset.category;


            openCategory(category);

        });

    });

}


// ========================================
// QUEST
// ========================================

function bindQuest() {

    const button =
        document.querySelector(".quest-button");


    if (!button) {
        return;
    }


    button.addEventListener("click", function() {

        showToast(
            "Daily Quest будет добавлен следующим этапом"
        );

    });

}


// ========================================
// OPEN CATEGORY
// ========================================

function openCategory(category) {

    if (!data[category]) {
        return;
    }


    closePage();


    const page =
        document.createElement("div");


    page.className =
        "category-page";


    const categoryNames = {

        finance: "💰 Финансы",

        health: "❤️ Здоровье",

        development: "🧠 Развитие"

    };


    const metrics =
        data[category];


    const categoryPercent =
        categoryProgress(category);


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
                    ${categoryNames[category]}
                </h2>

            </div>

        </div>


        <div class="category-summary">

            <div class="summary-label">
                CATEGORY PROGRESS
            </div>

            <div class="summary-value">
                ${categoryPercent}%
            </div>

            <div class="summary-bar">

                <div
                    class="summary-fill"
                    style="width:${categoryPercent}%"
                ></div>

            </div>

        </div>


        <div class="metrics-list">

            ${metrics.map(metricHTML).join("")}

        </div>

    `;


    document.body.appendChild(page);


    // Back button

    page
        .querySelector(".back-button")
        .addEventListener("click", function() {

            closePage();

            renderHome();

            activateHome();

        });


    // Edit buttons

    page
        .querySelectorAll(".metric-edit")
        .forEach(button => {

            button.addEventListener("click", function() {

                openEditor(
                    category,
                    this.dataset.metric
                );

            });

        });

}


// ========================================
// METRIC CARD
// ========================================

function metricHTML(metric) {

    const percent =
        progress(
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
                    ${percent}%
                </div>

            </div>


            <div class="metric-progress">

                <div
                    class="metric-progress-fill"
                    style="width:${percent}%"
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


// ========================================
// EDITOR
// ========================================

function openEditor(category, metricId) {

    const metric =
        data[category].find(
            item => item.id === metricId
        );


    if (!metric) {
        return;
    }


    const overlay =
        document.createElement("div");


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
                class="current-input"
                type="number"
                value="${metric.current}"
            >


            <label>
                Цель
            </label>

            <input
                class="target-input"
                type="number"
                value="${metric.target}"
            >


            <div class="editor-preview">

                <span>
                    Новый прогресс
                </span>

                <strong class="editor-progress">
                    ${progress(
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


    document.body.appendChild(overlay);


    const currentInput =
        overlay.querySelector(".current-input");


    const targetInput =
        overlay.querySelector(".target-input");


    const progressElement =
        overlay.querySelector(".editor-progress");


    function updatePreview() {

        progressElement.textContent =
            `${progress(
                currentInput.value,
                targetInput.value
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
        .querySelector(".editor-close")
        .addEventListener("click", function() {

            overlay.remove();

        });


    overlay.addEventListener("click", function(event) {

        if (event.target === overlay) {

            overlay.remove();

        }

    });


    overlay
        .querySelector(".save-button")
        .addEventListener("click", function() {

            metric.current =
                Number(currentInput.value) || 0;


            metric.target =
                Number(targetInput.value) || 0;


            saveData();


            overlay.remove();


            closePage();


            openCategory(category);


            showToast(
                "Цель сохранена"
            );

        });

}


// ========================================
// CLOSE PAGE
// ========================================

function closePage() {

    const page =
        document.querySelector(".category-page");


    if (page) {

        page.remove();

    }

}


// ========================================
// HOME NAV
// ========================================

function activateHome() {

    document
        .querySelectorAll(".nav-item")
        .forEach(button => {

            button.classList.remove("active");

        });


    const home =
        document.querySelector(".nav-item:first-child");


    if (home) {

        home.classList.add("active");

    }

}


// ========================================
// TOAST
// ========================================

function showToast(message) {

    const old =
        document.querySelector(".life-message");


    if (old) {
        old.remove();
    }


    const toast =
        document.createElement("div");


    toast.className =
        "life-message";


    toast.textContent =
        message;


    document.body.appendChild(toast);


    requestAnimationFrame(() => {

        toast.classList.add("show");

    });


    setTimeout(() => {

        toast.classList.remove("show");

        setTimeout(() => {

            toast.remove();

        }, 250);

    }, 1800);

}


// ========================================
// FORMAT
// ========================================

function formatNumber(value) {

    return new Intl.NumberFormat(
        "ru-RU"
    ).format(
        Number(value) || 0
    );

}
```
