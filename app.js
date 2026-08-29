```javascript
/* =========================================
   LIFE GAME — APP
   ========================================= */


/*
    Пока приложение работает
    на тестовых данных.

    На следующем этапе эти данные
    будут приходить из Telegram.

    После подключения D1 —
    из базы данных.
*/


// =========================================
// TEST DATA
// =========================================

const lifeData = {

    level: 1,

    xp: 0,

    xpTarget: 1000,

    overallProgress: 47,


    categories: {

        finance: {
            name: "Финансы",
            progress: 62
        },

        health: {
            name: "Здоровье",
            progress: 38
        },

        development: {
            name: "Развитие",
            progress: 54
        }

    }

};


// =========================================
// DOM READY
// =========================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        initializeApp();

    }
);


// =========================================
// INITIALIZE
// =========================================

function initializeApp() {

    renderLevel();

    renderOverallProgress();

    renderCategories();

    initializeCategoryClicks();

    initializeNavigation();

    initializeQuest();

}


// =========================================
// LEVEL
// =========================================

function renderLevel() {

    const levelElement =
        document.querySelector(".level-number");

    const xpElement =
        document.querySelector(".xp-value");

    const xpFill =
        document.querySelector(".xp-fill");


    if (levelElement) {

        levelElement.textContent =
            `LVL ${lifeData.level}`;

    }


    if (xpElement) {

        xpElement.textContent =
            `${lifeData.xp} XP`;

    }


    if (xpFill) {

        const xpPercent =
            Math.min(
                (lifeData.xp / lifeData.xpTarget) * 100,
                100
            );

        xpFill.style.width =
            `${xpPercent}%`;

    }

}


// =========================================
// OVERALL PROGRESS
// =========================================

function renderOverallProgress() {

    const value =
        document.querySelector(".overall-value");

    const bar =
        document.querySelector(".overall-fill");


    if (value) {

        value.innerHTML =
            `${lifeData.overallProgress}<span>%</span>`;

    }


    if (bar) {

        setTimeout(
            () => {

                bar.style.width =
                    `${lifeData.overallProgress}%`;

            },
            150
        );

    }

}


// =========================================
// CATEGORIES
// =========================================

function renderCategories() {

    Object.entries(
        lifeData.categories
    ).forEach(
        ([category, data]) => {

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
                    `${data.progress}%`;

            }


            if (fill) {

                setTimeout(
                    () => {

                        fill.style.width =
                            `${data.progress}%`;

                    },
                    200
                );

            }

        }
    );

}


// =========================================
// CATEGORY CLICK
// =========================================

function initializeCategoryClicks() {

    const cards =
        document.querySelectorAll(
            ".category-card"
        );


    cards.forEach(
        card => {

            card.addEventListener(
                "click",
                () => {

                    const category =
                        card.dataset.category;

                    openCategory(
                        category
                    );

                }
            );

        }
    );

}


// =========================================
// OPEN CATEGORY
// =========================================

function openCategory(category) {

    const data =
        lifeData.categories[category];


    if (!data) {
        return;
    }


    /*
        Пока показываем временное
        уведомление.

        На следующем этапе здесь
        откроется полноценная страница
        категории.
    */

    showMessage(
        `${data.name}: ${data.progress}%`
    );

}


// =========================================
// NAVIGATION
// =========================================

function initializeNavigation() {

    const navigationItems =
        document.querySelectorAll(
            ".nav-item"
        );


    navigationItems.forEach(
        item => {

            item.addEventListener(
                "click",
                () => {

                    const section =
                        item.dataset.section;


                    if (!section) {

                        setActiveNavigation(
                            item
                        );

                        return;

                    }


                    setActiveNavigation(
                        item
                    );


                    openCategory(
                        section
                    );

                }
            );

        }
    );

}


// =========================================
// ACTIVE NAVIGATION
// =========================================

function setActiveNavigation(
    activeItem
) {

    const items =
        document.querySelectorAll(
            ".nav-item"
        );


    items.forEach(
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
// DAILY QUEST
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
                "Daily Quest появится здесь."
            );

        }
    );

}


// =========================================
// MESSAGE
// =========================================

function showMessage(message) {

    /*
        Создаём небольшое временное
        уведомление вместо alert().
    */


    const existing =
        document.querySelector(
            ".life-message"
        );


    if (existing) {

        existing.remove();

    }


    const messageElement =
        document.createElement(
            "div"
        );


    messageElement.className =
        "life-message";


    messageElement.textContent =
        message;


    Object.assign(
        messageElement.style,
        {

            position: "fixed",

            left: "50%",

            bottom: "95px",

            transform:
                "translateX(-50%)",

            zIndex: "1000",

            padding:
                "12px 18px",

            border:
                "1px solid #303030",

            borderRadius:
                "14px",

            background:
                "rgba(20,20,20,.95)",

            color:
                "#ffffff",

            fontSize:
                "12px",

            fontWeight:
                "600",

            whiteSpace:
                "nowrap",

            boxShadow:
                "0 15px 40px rgba(0,0,0,.5)",

            backdropFilter:
                "blur(20px)",

            opacity: "0",

            transition:
                "opacity .2s ease"

        }
    );


    document.body.appendChild(
        messageElement
    );


    requestAnimationFrame(
        () => {

            messageElement.style.opacity =
                "1";

        }
    );


    setTimeout(
        () => {

            messageElement.style.opacity =
                "0";


            setTimeout(
                () => {

                    messageElement.remove();

                },
                200
            );

        },
        1800
    );

}
```
