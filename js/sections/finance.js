```javascript
/* =========================================================
   LIFE GAME — FINANCE SECTION
   js/sections/finance.js
   ========================================================= */

(function () {

    'use strict';

    /*
     * Финансовый раздел.
     *
     * Здесь находятся:
     * - расчёт финансового прогресса
     * - доход
     * - расходы
     * - свободные деньги
     * - процент расходов
     * - финансовая страница
     * - HTML расходов
     */

    window.LifeGameFinance = {

        /* -------------------------------------------------
           FINANCE PROGRESS
        ------------------------------------------------- */

        progress: function (state, expenses) {

            const c = state.categories.finance;

            const income = Number(c.monthlyIncome) || 0;

            const monthlyGoal =
                Math.max(
                    1,
                    Number(c.monthlyGoal) || 1
                );

            const yearlyGoal =
                Math.max(
                    1,
                    Number(c.yearlyGoal) || 1
                );

            const expensesTotal =
                expenses.reduce(
                    function (total, expense) {

                        return total +
                            (Number(expense.amount) || 0);

                    },
                    0
                );

            const monthlyProgress =
                Math.round(
                    income /
                    monthlyGoal *
                    100
                );

            const yearlyProgress =
                Math.round(
                    income * 12 /
                    yearlyGoal *
                    100
                );

            const savingsProgress =
                income > 0
                    ? Math.max(
                        0,
                        Math.min(
                            100,
                            Math.round(
                                (
                                    income -
                                    expensesTotal
                                ) /
                                income *
                                100
                            )
                        )
                    )
                    : 0;

            return Math.round(
                (
                    Math.max(
                        0,
                        monthlyProgress
                    ) +
                    Math.max(
                        0,
                        Math.min(
                            100,
                            yearlyProgress
                        )
                    ) +
                    savingsProgress
                ) / 3
            );

        },


        /* -------------------------------------------------
           TOTAL EXPENSES
        ------------------------------------------------- */

        expensesTotal: function (expenses) {

            return expenses.reduce(
                function (total, expense) {

                    return total +
                        (Number(expense.amount) || 0);

                },
                0
            );

        },


        /* -------------------------------------------------
           EXPENSE PERCENT
        ------------------------------------------------- */

        expensePercent: function (
            state,
            expenses
        ) {

            const income =
                Number(
                    state.categories.finance.monthlyIncome
                ) || 0;

            if (!income)
                return 0;

            return Math.round(
                this.expensesTotal(expenses) /
                income *
                100
            );

        },


        /* -------------------------------------------------
           SAVINGS
        ------------------------------------------------- */

        savings: function (
            state,
            expenses
        ) {

            const income =
                Number(
                    state.categories.finance.monthlyIncome
                ) || 0;

            return Math.max(
                0,
                income -
                this.expensesTotal(expenses)
            );

        },


        /* -------------------------------------------------
           EXPENSE HTML
        ------------------------------------------------- */

        expenseHTML: function (expense) {

            const esc =
                window.LifeGameUtils &&
                window.LifeGameUtils.escapeHTML
                    ? window.LifeGameUtils.escapeHTML
                    : function (value) {
                        return String(value);
                    };

            const fmt =
                window.LifeGameUtils &&
                window.LifeGameUtils.formatNumber
                    ? window.LifeGameUtils.formatNumber
                    : function (value) {
                        return new Intl.NumberFormat(
                            'ru-RU'
                        ).format(
                            Number(value) || 0
                        );
                    };

            return `
                <div
                    class="expense-swipe"
                    data-swipe-id="${esc(expense.id)}"
                >

                    <div class="expense-delete-reveal">
                        УДАЛИТЬ
                    </div>

                    <div class="expense">

                        <div class="expense-info">

                            <div class="expense-name">
                                ${esc(expense.name)}
                            </div>

                            <div class="expense-amount">
                                ${fmt(expense.amount)} ₽
                            </div>

                        </div>

                        <div class="expense-actions">

                            <button
                                class="small-btn expense-edit"
                                data-id="${esc(expense.id)}"
                            >
                                ✎
                            </button>

                        </div>

                    </div>

                </div>
            `;

        },


        /* -------------------------------------------------
           FINANCE PAGE
        ------------------------------------------------- */

        page: function (
            state,
            expenses,
            ui
        ) {

            const c =
                state.categories.finance;

            const income =
                Number(c.monthlyIncome) || 0;

            const totalExpenses =
                this.expensesTotal(expenses);

            const expensePercent =
                this.expensePercent(
                    state,
                    expenses
                );

            const savings =
                this.savings(
                    state,
                    expenses
                );

            const progress =
                this.progress(
                    state,
                    expenses
                );

            const collapsed =
                Boolean(
                    ui &&
                    ui.expensesCollapsed
                );

            const fmt =
                window.LifeGameUtils &&
                window.LifeGameUtils.formatNumber
                    ? window.LifeGameUtils.formatNumber
                    : function (value) {
                        return new Intl.NumberFormat(
                            'ru-RU'
                        ).format(
                            Number(value) || 0
                        );
                    };

            const clamp =
                window.LifeGameUtils &&
                window.LifeGameUtils.clamp
                    ? window.LifeGameUtils.clamp
                    : function (value, min, max) {
                        return Math.min(
                            max,
                            Math.max(
                                min,
                                value
                            )
                        );
                    };

            const metric =
                window.LifeGameUtils &&
                window.LifeGameUtils.metric
                    ? window.LifeGameUtils.metric
                    : function () {
                        return '';
                    };

            const mp = function (
                a,
                b,
                over100
            ) {

                const value =
                    b > 0
                        ? Math.round(
                            Number(a || 0) /
                            Number(b || 0) *
                            100
                        )
                        : 0;

                return over100
                    ? Math.max(
                        0,
                        value
                    )
                    : clamp(
                        value,
                        0,
                        100
                    );

            };

            return `

                <div class="summary">

                    <div class="section-label">
                        FINANCE LEVEL ${c.level}
                    </div>

                    <div class="summary-number">
                        ${progress}%
                    </div>

                    <div class="progress">
                        <i style="width:${clamp(
                            progress,
                            0,
                            100
                        )}%"></i>
                    </div>

                    <div class="finance-box">

                        <div class="finance-line">

                            <span>
                                FINANCE XP
                            </span>

                            <strong>
                                ${fmt(c.xp)} XP
                            </strong>

                        </div>

                        <div class="finance-line">

                            <span>
                                STREAK
                            </span>

                            <strong>
                                🔥 ${c.streak}
                            </strong>

                        </div>

                    </div>

                </div>

                <div class="cards">

                    ${
                        metric(
                            '💵',
                            'Заработано за месяц',
                            fmt(income)+' ₽',
                            fmt(c.monthlyGoal)+' ₽',
                            mp(
                                income,
                                c.monthlyGoal,
                                true
                            ),
                            'income'
                        )
                    }

                    <div
                        class="metric expenses-metric"
                        id="expensesMetric"
                    >

                        <div class="metric-head">

                            <div class="metric-left">

                                <div class="metric-icon">
                                    📉
                                </div>

                                <div class="metric-text">

                                    <strong>
                                        Обязательные расходы
                                    </strong>

                                    <span>
                                        ${fmt(totalExpenses)}
                                        ₽ ·
                                        ${expensePercent}%
                                        от заработка
                                    </span>

                                </div>

                            </div>

                            <div class="metric-percent">
                                ${expensePercent}%
                            </div>

                        </div>

                        <div class="metric-bar">

                            <i
                                style="width:${Math.min(
                                    expensePercent,
                                    100
                                )}%"
                            ></i>

                        </div>

                        <div
                            class="expenses ${
                                collapsed
                                    ? 'collapsed'
                                    : ''
                            }"
                        >

                            <button
                                class="expenses-title"
                                id="expensesToggle"
                                type="button"
                                aria-expanded="${
                                    !collapsed
                                }"
                            >

                                <div
                                    class="expenses-title-left"
                                >

                                    <span>
                                        МОИ ОБЯЗАТЕЛЬНЫЕ
                                        РАСХОДЫ
                                    </span>

                                </div>

                                <strong>
                                    ${fmt(totalExpenses)} ₽
                                </strong>

                            </button>

                            <div class="expense-content">

                                <div class="expense-list">

                                    ${
                                        expenses.length
                                            ? expenses
                                                .map(
                                                    this.expenseHTML
                                                )
                                                .join('')
                                            : `
                                                <div class="notice">

                                                    Добавь
                                                    обязательные
                                                    расходы:
                                                    аренда,
                                                    коммунальные
                                                    услуги,
                                                    продукты,
                                                    транспорт,
                                                    связь и т.д.

                                                </div>
                                            `
                                    }

                                </div>

                                <button
                                    class="add"
                                    id="addExpense"
                                >
                                    ＋ ДОБАВИТЬ РАСХОД
                                </button>

                                <div class="ratio">

                                    <span>
                                        РАСХОДЫ / ДОХОД
                                    </span>

                                    <strong>
                                        ${expensePercent}%
                                    </strong>

                                </div>

                                <div class="ratio">

                                    <span>
                                        СВОБОДНЫЕ ДЕНЬГИ
                                    </span>

                                    <strong>
                                        ${fmt(savings)} ₽
                                    </strong>

                                </div>

                            </div>

                        </div>

                    </div>

                    ${
                        metric(
                            '🏆',
                            'Цель на год',
                            fmt(income * 12)+' ₽',
                            fmt(c.yearlyGoal)+' ₽',
                            mp(
                                income * 12,
                                c.yearlyGoal
                            ),
                            'yearlyGoal'
                        )
                    }

                    ${
                        metric(
                            '🛡️',
                            'Финансовая эффективность',
                            expensePercent <= 0
                                ? '—'
                                : (
                                    100 -
                                    expensePercent
                                ) +
                                '% свободного дохода',
                            '100%',
                            clamp(
                                100 -
                                expensePercent,
                                0,
                                100
                            ),
                            null
                        )
                    }

                    <div class="notice">

                        💡 В «Заработано за месяц»
                        можно задать фактический
                        доход и личную цель
                        на месяц.

                    </div>

                    ${
                        window.LifeGameUtils &&
                        window.LifeGameUtils.creatorHTML
                            ? window.LifeGameUtils.creatorHTML()
                            : ''
                    }

                </div>

            `;

        }

    };


    /*
     * Сигнал в консоль.
     * Позволяет быстро проверить,
     * что файл действительно подключён.
     */

    console.log(
        'LIFE GAME: finance.js loaded'
    );

})();
```
