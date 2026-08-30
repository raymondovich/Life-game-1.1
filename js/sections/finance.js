```javascript
// LIFE GAME
// FINANCE MODULE
// Финансовая система
//
// Состав:
// 1. Заработано за месяц
// 2. Цель за месяц
// 3. Обязательные расходы
// 4. Финансовая подушка
// 5. Финансовое состояние
//
// Расходы:
// - открываются свайпом вправо по блоку
// - удаляются свайпом влево по конкретному расходу
//
// Storage:
// life_game_expenses_v3
//
// State:
// state.categories.finance
// ================================================================


import {
    num,
    clamp,
    fmt,
    esc,
    percent
} from './utils.js';

import {
    xpWithStreak
} from './xp.js';


// ================================================================
// STORAGE KEY
// ================================================================

const EXPENSES_KEY =
    'life_game_expenses_v3';


// ================================================================
// INTERNAL HELPERS
// ================================================================

function financeState(state) {

    if (!state.categories) {
        state.categories = {};
    }

    if (!state.categories.finance) {
        state.categories.finance = {
            xp: 0,
            level: 1,
            streak: 0,
            bestStreak: 0,
            monthlyIncome: 0,
            monthlyGoal: 100000,
            yearlyGoal: 1200000,
            savings: 0
        };
    }

    const finance =
        state.categories.finance;


    // Защита от старых/неполных данных

    finance.xp =
        num(finance.xp);

    finance.level =
        Math.max(
            1,
            num(finance.level) || 1
        );

    finance.streak =
        Math.max(
            0,
            num(finance.streak)
        );

    finance.bestStreak =
        Math.max(
            0,
            num(finance.bestStreak)
        );

    finance.monthlyIncome =
        Math.max(
            0,
            num(finance.monthlyIncome)
        );

    finance.monthlyGoal =
        Math.max(
            0,
            num(finance.monthlyGoal)
        );

    finance.yearlyGoal =
        Math.max(
            0,
            num(finance.yearlyGoal)
        );

    finance.savings =
        Math.max(
            0,
            num(finance.savings)
        );


    return finance;

}


// ================================================================
// EXPENSES
// ================================================================

function loadExpenses() {

    try {

        const raw =
            localStorage.getItem(
                EXPENSES_KEY
            );

        const data =
            JSON.parse(
                raw || '[]'
            );

        if (!Array.isArray(data)) {
            return [];
        }

        return data
            .map(expense => ({

                id: String(
                    expense.id ||
                    (
                        Date.now() +
                        Math.random()
                    )
                ),

                name: String(
                    expense.name || ''
                ),

                amount: Math.max(
                    0,
                    num(expense.amount)
                )

            }))
            .filter(expense =>
                expense.name &&
                expense.amount > 0
            );

    } catch (error) {

        console.error(
            'LIFE GAME: failed to load finance expenses',
            error
        );

        return [];

    }

}


function saveExpenses(expenses) {

    localStorage.setItem(
        EXPENSES_KEY,
        JSON.stringify(expenses)
    );

}


// ================================================================
// TOTAL EXPENSES
// ================================================================

function totalExpenses() {

    return loadExpenses()
        .reduce(
            (
                total,
                expense
            ) =>
                total +
                num(expense.amount),
            0
        );

}


// ================================================================
// EXPENSE PERCENT
// ================================================================

function expensePercent(
    income,
    expenses
) {

    if (income <= 0) {
        return 0;
    }

    return Math.max(
        0,
        Math.round(
            expenses /
            income *
            100
        )
    );

}


// ================================================================
// SAVINGS PERCENT
// ================================================================

function savingsPercent(
    income,
    savings
) {

    if (income <= 0) {
        return 0;
    }

    return Math.max(
        0,
        Math.round(
            savings /
            income *
            100
        )
    );

}


// ================================================================
// FINANCIAL HEALTH
//
// Чем:
// + больше доход
// + больше накопления
// - меньше расходы
//
// тем выше результат.
//
// Базовая модель:
// 40% — выполнение цели
// 30% — уровень накоплений
// 30% — низкий уровень расходов
// ================================================================

function financialHealth(
    income,
    goal,
    expenses,
    savings
) {

    if (
        income <= 0 &&
        goal <= 0 &&
        expenses <= 0 &&
        savings <= 0
    ) {
        return 0;
    }


    const goalScore =
        goal > 0
            ? clamp(
                Math.round(
                    income /
                    goal *
                    100
                ),
                0,
                100
            )
            : income > 0
                ? 100
                : 0;


    const savingsScore =
        income > 0
            ? clamp(
                Math.round(
                    savings /
                    income *
                    100
                ),
                0,
                100
            )
            : 0;


    const expenseRatio =
        income > 0
            ? expenses /
              income
            : 1;


    const expenseScore =
        clamp(
            Math.round(
                (
                    1 -
                    expenseRatio
                ) *
                100
            ),
            0,
            100
        );


    return clamp(
        Math.round(
            goalScore * 0.4 +
            savingsScore * 0.3 +
            expenseScore * 0.3
        ),
        0,
        100
    );

}


// ================================================================
// ADD XP
// ================================================================

function addFinanceXP(
    state,
    baseXP = 5
) {

    const finance =
        financeState(state);


    const gained =
        xpWithStreak(
            baseXP,
            finance.streak
        );


    finance.xp +=
        gained;


    // Уровень пересчитывается
    // через общий XP-механизм приложения,
    // если он доступен.

    if (
        typeof window !== 'undefined' &&
        typeof window.updateLevels === 'function'
    ) {

        window.updateLevels(
            state
        );

    }


    return gained;

}


// ================================================================
// UPDATE
// ================================================================

function updateFinance(
    state
) {

    const finance =
        financeState(state);

    const expenses =
        totalExpenses();


    finance.expenses =
        expenses;


    finance.expensesPercent =
        expensePercent(
            finance.monthlyIncome,
            expenses
        );


    finance.savingsPercent =
        savingsPercent(
            finance.monthlyIncome,
            finance.savings
        );


    finance.financialHealth =
        financialHealth(
            finance.monthlyIncome,
            finance.monthlyGoal,
            expenses,
            finance.savings
        );


    return finance;

}


// ================================================================
// METRIC HTML
// ================================================================

function metric(
    icon,
    title,
    value,
    target,
    progress,
    id,
    extra = ''
) {

    return `

        <div
            class="metric finance-metric"
            data-finance-id="${esc(id)}"
        >

            <div class="metric-icon">
                ${icon}
            </div>


            <div class="metric-content">

                <div class="metric-head">

                    <strong>
                        ${esc(title)}
                    </strong>

                    <span class="metric-percent">
                        ${progress}%
                    </span>

                </div>


                <div class="metric-text">

                    <span>
                        ${esc(value)}
                        ${extra}
                    </span>

                    <small>
                        ${esc(target)}
                    </small>

                </div>


                <div class="metric-bar">

                    <i
                        style="width:${clamp(
                            progress,
                            0,
                            100
                        )}%"
                    ></i>

                </div>

            </div>

        </div>

    `;

}


// ================================================================
// EXPENSES BLOCK
// ================================================================

function expensesHTML(
    income
) {

    const expenses =
        loadExpenses();

    const total =
        expenses.reduce(
            (
                sum,
                expense
            ) =>
                sum +
                num(expense.amount),
            0
        );


    const p =
        expensePercent(
            income,
            total
        );


    const rows =
        expenses.length

            ? expenses.map(
                expense => `

                    <div
                        class="finance-expense-row"
                        data-expense-id="${esc(
                            expense.id
                        )}"
                    >

                        <div
                            class="finance-expense-swipe"
                        >

                            <div class="finance-expense-info">

                                <strong>
                                    ${esc(
                                        expense.name
                                    )}
                                </strong>

                                <span>
                                    ${fmt(
                                        expense.amount
                                    )} ₽
                                </span>

                            </div>

                        </div>

                    </div>

                `
            ).join('')

            : `

                <div class="finance-expenses-empty">

                    Обязательных расходов пока нет

                </div>

            `;


    return `

        <div
            class="finance-expenses"
            id="financeExpenses"
        >

            <div
                class="finance-expenses-header"
            >

                <div>

                    <div class="finance-expenses-title">
                        ОБЯЗАТЕЛЬНЫЕ РАСХОДЫ
                    </div>

                    <div class="finance-expenses-subtitle">
                        ${fmt(total)} ₽
                    </div>

                </div>


                <div
                    class="finance-expenses-percent"
                >
                    ${p}%
                </div>

            </div>


            <div
                class="finance-expenses-list"
            >

                ${rows}

            </div>


            <button
                type="button"
                class="finance-add-expense"
                onclick="window.addFinanceExpense()"
            >
                + Добавить расход
            </button>

        </div>

    `;

}


// ================================================================
// PAGE
// ================================================================

function page(
    state,
    helpers
) {

    const finance =
        updateFinance(state);


    const income =
        finance.monthlyIncome;

    const goal =
        finance.monthlyGoal;

    const expenses =
        finance.expenses;

    const savings =
        finance.savings;


    const incomeProgress =
        goal > 0
            ? clamp(
                Math.round(
                    income /
                    goal *
                    100
                ),
                0,
                100
            )
            : 0;


    const expenseProgress =
        finance.expensesPercent;


    const savingsProgress =
        finance.savingsPercent;


    const health =
        finance.financialHealth;


    const creatorHTML =
        helpers &&
        typeof helpers.creatorHTML === 'function'
            ? helpers.creatorHTML()
            : '';


    return `

        <div class="summary">

            <div class="section-label">
                FINANCE
                LEVEL ${finance.level}
            </div>


            <div class="summary-number">
                ${health}%
            </div>


            <div class="progress">

                <i
                    style="width:${health}%"
                ></i>

            </div>


            <div class="finance-box">

                <div class="finance-line">

                    <span>
                        FINANCIAL STATE
                    </span>

                    <strong>
                        ${health}%
                    </strong>

                </div>


                <div class="finance-line">

                    <span>
                        FINANCE XP
                    </span>

                    <strong>
                        ${fmt(finance.xp)} XP
                    </strong>

                </div>


                <div class="finance-line">

                    <span>
                        STREAK
                    </span>

                    <strong>
                        🔥 ${finance.streak}
                    </strong>

                </div>

            </div>

        </div>


        <div class="cards">


            <!-- =========================================
                 ЗАРАБОТАНО
            ========================================== -->

            ${metric(
                '💵',
                'Заработано за месяц',
                fmt(income) + ' ₽',
                'Изменить доход',
                incomeProgress,
                'monthlyIncome'
            )}


            <!-- =========================================
                 ЦЕЛЬ
            ========================================== -->

            ${metric(
                '🎯',
                'Цель за месяц',
                fmt(goal) + ' ₽',
                'Месячная финансовая цель',
                incomeProgress,
                'monthlyGoal'
            )}


            <!-- =========================================
                 ОБЯЗАТЕЛЬНЫЕ РАСХОДЫ
            ========================================== -->

            ${expensesHTML(
                income
            )}


            <!-- =========================================
                 ФИНАНСОВАЯ ПОДУШКА
            ========================================== -->

            ${metric(
                '🛡️',
                'Финансовая подушка',
                fmt(savings) + ' ₽',
                'Накопления',
                savingsProgress,
                'savings'
            )}


            <!-- =========================================
                 ФИНАНСОВОЕ СОСТОЯНИЕ
            ========================================== -->

            <div
                class="finance-status-card"
                data-finance-status="true"
            >

                <div class="finance-status-header">

                    <div>

                        <div class="finance-status-label">
                            ФИНАНСОВОЕ СОСТОЯНИЕ
                        </div>

                        <div class="finance-status-title">
                            ${health}%
                        </div>

                    </div>


                    <div class="finance-status-icon">
                        ${health >= 80
                            ? '💎'
                            : health >= 60
                                ? '📈'
                                : health >= 30
                                    ? '⚠️'
                                    : '🔴'
                        }
                    </div>

                </div>


                <div class="finance-status-bar">

                    <i
                        style="width:${health}%"
                    ></i>

                </div>


                <div class="finance-status-description">

                    Чем больше заработано,
                    меньше обязательных расходов
                    и больше накоплений —
                    тем выше финансовое состояние.

                </div>

            </div>


            <div class="notice">

                Финансовый прогресс
                сохраняется автоматически.

                Процент расходов считается
                от заработанного за месяц.

                Процент финансовой подушки
                также считается от заработанного
                за месяц.

            </div>


            ${creatorHTML}

        </div>

    `;

}


// ================================================================
// EDITOR LABELS
// ================================================================

const labels = {

    monthlyIncome:
        'Заработано за месяц',

    monthlyGoal:
        'Цель за месяц',

    savings:
        'Финансовая подушка'

};


// ================================================================
// CAN EDIT
// ================================================================

function canEdit(id) {

    return Object.prototype.hasOwnProperty.call(
        labels,
        id
    );

}


// ================================================================
// EDIT
// ================================================================

function edit(
    state,
    id
) {

    if (!canEdit(id)) {
        return false;
    }


    const finance =
        financeState(state);


    const current =
        num(
            finance[id]
        );


    const title =
        labels[id];


    const value =
        prompt(
            `Введите значение: ${title}`,
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

        if (
            typeof window.showToast ===
            'function'
        ) {

            window.showToast(
                '⚠️ Введите корректное значение'
            );

        }

        return false;

    }


    finance[id] =
        Math.round(number);


    addFinanceXP(
        state,
        5
    );


    updateFinance(
        state
    );


    return true;

}


// ================================================================
// ADD EXPENSE
// ================================================================

function addExpense() {

    const name =
        prompt(
            'Название обязательного расхода:'
        );


    if (
        name === null ||
        !name.trim()
    ) {
        return;
    }


    const amountInput =
        prompt(
            'Сумма расхода в ₽:'
        );


    if (
        amountInput === null
    ) {
        return;
    }


    const amount =
        Number(
            amountInput.replace(
                /\s/g,
                ''
            )
        );


    if (
        !Number.isFinite(amount) ||
        amount <= 0
    ) {

        if (
            typeof window.showToast ===
            'function'
        ) {

            window.showToast(
                '⚠️ Введите корректную сумму'
            );

        }

        return;

    }


    const expenses =
        loadExpenses();


    expenses.push({

        id:
            String(
                Date.now() +
                Math.random()
            ),

        name:
            name.trim(),

        amount:
            Math.round(amount)

    });


    saveExpenses(
        expenses
    );


    if (
        typeof window.showToast ===
        'function'
    ) {

        window.showToast(
            '💸 Расход добавлен'
        );

    }


    refreshPage();

}


// ================================================================
// DELETE EXPENSE
// ================================================================

function deleteExpense(
    id
) {

    const expenses =
        loadExpenses();


    const filtered =
        expenses.filter(
            expense =>
                String(expense.id) !==
                String(id)
        );


    if (
        filtered.length ===
        expenses.length
    ) {
        return;
    }


    saveExpenses(
        filtered
    );


    if (
        typeof window.showToast ===
        'function'
    ) {

        window.showToast(
            '🗑️ Расход удалён'
        );

    }


    refreshPage();

}


// ================================================================
// REFRESH
// ================================================================

function refreshPage() {

    if (
        typeof window.openCategoryPage ===
        'function'
    ) {

        window.openCategoryPage(
            'finance'
        );

        return;

    }


    if (
        typeof window.renderApp ===
        'function'
    ) {

        window.renderApp();

    }

}


// ================================================================
// EXPENSE SWIPE
// ================================================================
//
// iPhone-style interaction:
//
// свайп вправо:
// раскрытие блока расходов
//
// свайп влево:
// удаление конкретного расхода
// ================================================================

function initExpenseSwipe() {

    const container =
        document.getElementById(
            'financeExpenses'
        );


    if (!container) {
        return;
    }


    let startX = 0;
    let startY = 0;
    let currentRow = null;


    container.addEventListener(
        'touchstart',
        event => {

            const touch =
                event.touches[0];

            startX =
                touch.clientX;

            startY =
                touch.clientY;


            currentRow =
                event.target.closest(
                    '.finance-expense-row'
                );

        },
        {
            passive: true
        }
    );


    container.addEventListener(
        'touchend',
        event => {

            if (!currentRow) {
                return;
            }


            const touch =
                event.changedTouches[0];


            const deltaX =
                touch.clientX -
                startX;


            const deltaY =
                touch.clientY -
                startY;


            // Не реагируем на вертикальный скролл

            if (
                Math.abs(deltaY) >
                Math.abs(deltaX)
            ) {

                currentRow = null;
                return;

            }


            // Минимальная длина свайпа

            if (
                Math.abs(deltaX) <
                60
            ) {

                currentRow = null;
                return;

            }


            const id =
                currentRow.dataset.expenseId;


            // Свайп влево = удалить

            if (
                deltaX < -60
            ) {

                deleteExpense(
                    id
                );

            }


            currentRow = null;

        },
        {
            passive: true
        }
    );


    // ------------------------------------------------
    // Свайп по самому блоку расходов
    // вправо открывает список
    // ------------------------------------------------

    let blockStartX = 0;
    let blockStartY = 0;


    container.addEventListener(
        'touchstart',
        event => {

            if (
                event.target.closest(
                    '.finance-expense-row'
                )
            ) {
                return;
            }

            const touch =
                event.touches[0];

            blockStartX =
                touch.clientX;

            blockStartY =
                touch.clientY;

        },
        {
            passive: true
        }
    );


    container.addEventListener(
        'touchend',
        event => {

            const touch =
                event.changedTouches[0];


            const deltaX =
                touch.clientX -
                blockStartX;


            const deltaY =
                touch.clientY -
                blockStartY;


            if (
                Math.abs(deltaY) >
                Math.abs(deltaX)
            ) {
                return;
            }


            if (
                deltaX > 60
            ) {

                container.classList.add(
                    'is-open'
                );

            }

        },
        {
            passive: true
        }
    );

}


// ================================================================
// GLOBAL EDIT HANDLER
// ================================================================

window.handleFinanceEdit =
    function(
        id
    ) {

        if (
            typeof window.lifeGameState ===
            'undefined'
        ) {
            return;
        }


        const state =
            window.lifeGameState;


        if (
            edit(
                state,
                id
            )
        ) {

            refreshPage();

        }

    };


// ================================================================
// GLOBAL ADD EXPENSE
// ================================================================

window.addFinanceExpense =
    function() {

        addExpense();

    };


// ================================================================
// GLOBAL DELETE EXPENSE
// ================================================================

window.deleteFinanceExpense =
    function(id) {

        deleteExpense(
            id
        );

    };


// ================================================================
// INIT
// ================================================================

function init() {

    initExpenseSwipe();

}


document.addEventListener(
    'DOMContentLoaded',
    init
);


// ================================================================
// PUBLIC MODULE
// ================================================================

window.LifeGameFinance = {

    page,

    labels,

    canEdit,

    edit,

    loadExpenses,

    saveExpenses,

    totalExpenses,

    expensePercent,

    savingsPercent,

    financialHealth,

    updateFinance,

    addExpense,

    deleteExpense,

    initExpenseSwipe

};


console.log(
    'LIFE GAME: finance.js loaded'
);
```
