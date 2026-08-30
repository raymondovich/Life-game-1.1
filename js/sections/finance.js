(function () {

'use strict';


/* ============================================================
   LIFE GAME — FINANCE MODULE
   ============================================================ */


/* ============================================================
   HELPERS
   ============================================================ */

function number(value) {

    const n = Number(value);

    return Number.isFinite(n)
        ? n
        : 0;

}


function money(value) {

    return new Intl.NumberFormat(
        'ru-RU',
        {
            maximumFractionDigits: 0
        }
    ).format(
        Math.round(number(value))
    );

}


function clamp(
    value,
    min,
    max
) {

    return Math.min(
        Math.max(
            number(value),
            min
        ),
        max
    );

}


function safePercent(
    value
) {

    if (
        !Number.isFinite(value) ||
        value < 0
    ) {

        return 0;

    }

    return Math.round(
        value * 10
    ) / 10;

}


/* ============================================================
   FINANCE OBJECT
   ============================================================ */

const Finance = {


    /* ==========================================================
       PROGRESS
       ========================================================== */

    progress: function (state) {

        const finance =
            state &&
            state.categories &&
            state.categories.finance
                ? state.categories.finance
                : {};


        const income =
            number(
                finance.monthlyIncome
            );


        const goal =
            number(
                finance.monthlyGoal
            );


        if (goal <= 0) {

            return 0;

        }


        return clamp(
            Math.round(
                income /
                goal *
                100
            ),
            0,
            100
        );

    },


    /* ==========================================================
       CALCULATIONS
       ========================================================== */

    calculations: function (state) {

        const finance =
            state &&
            state.categories &&
            state.categories.finance
                ? state.categories.finance
                : {};


        const income =
            Math.max(
                0,
                number(
                    finance.monthlyIncome
                )
            );


        const goal =
            Math.max(
                0,
                number(
                    finance.monthlyGoal
                )
            );


        const expenses =
            Math.max(
                0,
                number(
                    finance.mandatoryExpenses
                )
            );


        const reserve =
            Math.max(
                0,
                number(
                    finance.financialReserve
                )
            );


        const incomeProgress =
            goal > 0
                ? safePercent(
                    income /
                    goal *
                    100
                )
                : 0;


        const expensePercent =
            income > 0
                ? safePercent(
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

    },


    /* ==========================================================
       CAN EDIT
       ========================================================== */

    canEdit: function (id) {

        return [

            'monthlyIncome',

            'monthlyGoal',

            'mandatoryExpenses',

            'financialReserve'

        ].includes(
            id
        );

    },


    /* ==========================================================
       LABELS
       ========================================================== */

    labels: {

        monthlyIncome:
            'Заработано за месяц',

        monthlyGoal:
            'Цель на месяц',

        mandatoryExpenses:
            'Обязательные траты',

        financialReserve:
            'Финансовая подушка'

    },


    /* ==========================================================
       EDIT
       ========================================================== */

    edit: function (
        state,
        id
    ) {

        if (
            !this.canEdit(id)
        ) {

            return false;

        }


        const finance =
            state.categories.finance;


        const current =
            number(
                finance[id]
            );


        let title =
            this.labels[id];


        let message =
            title +
            '\n\nВведите сумму в ₽:';


        const value =
            window.prompt(
                message,
                String(
                    Math.round(
                        current
                    )
                )
            );


        if (
            value === null
        ) {

            return false;

        }


        const cleaned =
            String(value)
                .replace(
                    /\s/g,
                    ''
                )
                .replace(
                    ',',
                    '.'
                );


        const parsed =
            Number(
                cleaned
            );


        if (
            !Number.isFinite(parsed) ||
            parsed < 0
        ) {

            if (
                typeof window.showToast ===
                'function'
            ) {

                window.showToast(
                    '⚠️ Введите корректную сумму'
                );

            }


            return false;

        }


        finance[id] =
            Math.round(
                parsed
            );


        return true;

    },


    /* ==========================================================
       PAGE
       ========================================================== */

    page: function (
        state,
        helpers
    ) {

        const calc =
            this.calculations(
                state
            );


        const progress =
            calc.incomeProgress;


        const expensePercent =
            calc.expensePercent;


        const freeMoney =
            calc.freeMoney;


        const freeMoneyClass =
            freeMoney < 0
                ? 'negative'
                : 'positive';


        return `

        <div class="finance-page">


            <!-- =================================================
                 1. EARNED THIS MONTH
                 ================================================= -->

            <section
                class="
                    finance-card
                    finance-income-card
                "
            >

                <div class="finance-card-top">

                    <div>

                        <div class="finance-eyebrow">
                            FINANCE
                        </div>

                        <h3>
                            Заработано за месяц
                        </h3>

                    </div>

                </div>


                <div
                    class="
                        finance-main-value
                    "
                >

                    ${money(
                        calc.income
                    )}

                    <span>₽</span>

                </div>


                <button
                    type="button"
                    class="finance-edit"
                    data-edit="monthlyIncome"
                >
                    ✎ ИЗМЕНИТЬ
                </button>


                <div class="finance-divider">
                </div>


                <div class="finance-goal-row">

                    <div>

                        <span
                            class="
                                finance-small-label
                            "
                        >
                            Цель на месяц
                        </span>

                        <strong>

                            ${money(
                                calc.goal
                            )}

                            ₽

                        </strong>

                    </div>


                    <button
                        type="button"
                        class="finance-edit finance-edit-small"
                        data-edit="monthlyGoal"
                    >
                        ✎
                    </button>

                </div>


                <div class="finance-progress-header">

                    <span>
                        Выполнение плана
                    </span>

                    <strong>
                        ${progress}%
                    </strong>

                </div>


                <div
                    class="
                        finance-progress
                    "
                >

                    <i
                        style="
                            width:
                            ${Math.min(
                                progress,
                                100
                            )}%;
                        "
                    ></i>

                </div>


            </section>



            <!-- =================================================
                 2. MANDATORY EXPENSES
                 ================================================= -->

            <section
                class="
                    finance-card
                    finance-expenses-card
                "
            >

                <div class="finance-card-title">

                    <div
                        class="
                            finance-card-icon
                        "
                    >
                        🧾
                    </div>


                    <div>

                        <div
                            class="
                                finance-eyebrow
                            "
                        >
                            EXPENSES
                        </div>

                        <h3>
                            Обязательные траты
                        </h3>

                    </div>

                </div>


                <div
                    class="
                        finance-main-value
                    "
                >

                    ${money(
                        calc.expenses
                    )}

                    <span>₽</span>

                </div>


                <button
                    type="button"
                    class="finance-edit"
                    data-edit="mandatoryExpenses"
                >
                    ✎ ИЗМЕНИТЬ
                </button>


                <div
                    class="
                        finance-expense-percent
                    "
                >

                    <div>

                        <span>
                            От заработанного
                        </span>

                        <strong>
                            ${expensePercent}%
                        </strong>

                    </div>


                    <div
                        class="
                            finance-mini-bar
                        "
                    >

                        <i
                            style="
                                width:
                                ${Math.min(
                                    expensePercent,
                                    100
                                )}%;
                            "
                        ></i>

                    </div>

                </div>


            </section>



            <!-- =================================================
                 3. FINANCIAL RESERVE
                 ================================================= -->

            <section
                class="
                    finance-card
                    finance-reserve-card
                "
            >

                <div class="finance-card-title">

                    <div
                        class="
                            finance-card-icon
                        "
                    >
                        🛡
                    </div>


                    <div>

                        <div
                            class="
                                finance-eyebrow
                            "
                        >
                            RESERVE
                        </div>

                        <h3>
                            Финансовая подушка
                        </h3>

                    </div>

                </div>


                <div
                    class="
                        finance-main-value
                    "
                >

                    ${money(
                        calc.reserve
                    )}

                    <span>₽</span>

                </div>


                <button
                    type="button"
                    class="finance-edit"
                    data-edit="financialReserve"
                >
                    ✎ ИЗМЕНИТЬ
                </button>


            </section>



            <!-- =================================================
                 4. FINANCIAL STATE
                 ================================================= -->

            <section
                class="
                    finance-card
                    finance-state-card
                    ${freeMoneyClass}
                "
            >

                <div class="finance-card-title">

                    <div
                        class="
                            finance-card-icon
                        "
                    >
                        ◆
                    </div>


                    <div>

                        <div
                            class="
                                finance-eyebrow
                            "
                        >
                            FINANCIAL STATE
                        </div>

                        <h3>
                            Финансовое состояние
                        </h3>

                    </div>

                </div>


                <div
                    class="
                        finance-free-value
                    "
                >

                    ${money(
                        freeMoney
                    )}

                    <span>₽</span>

                </div>


                <div
                    class="
                        finance-free-label
                    "
                >

                    ${
                        freeMoney >= 0
                            ? 'Свободные деньги'
                            : 'Дефицит'
                    }

                </div>


                <div
                    class="
                        finance-breakdown
                    "
                >

                    <div
                        class="
                            finance-breakdown-row
                        "
                    >

                        <span>
                            Заработано
                        </span>

                        <strong>
                            ${money(
                                calc.income
                            )} ₽
                        </strong>

                    </div>


                    <div
                        class="
                            finance-breakdown-row
                        "
                    >

                        <span>
                            Обязательные траты
                        </span>

                        <strong>
                            − ${money(
                                calc.expenses
                            )} ₽
                        </strong>

                    </div>


                    <div
                        class="
                            finance-breakdown-row
                        "
                    >

                        <span>
                            Финансовая подушка
                        </span>

                        <strong>
                            − ${money(
                                calc.reserve
                            )} ₽
                        </strong>

                    </div>


                    <div
                        class="
                            finance-breakdown-line
                        "
                    ></div>


                    <div
                        class="
                            finance-breakdown-row
                            finance-breakdown-total
                        "
                    >

                        <span>
                            Свободно
                        </span>

                        <strong>
                            ${money(
                                freeMoney
                            )} ₽
                        </strong>

                    </div>

                </div>


            </section>


        </div>

        `;

    },


    /* ==========================================================
       SWIPE PLACEHOLDER
       ========================================================== */

    initExpenseSwipe: function () {

        /*
         * Оставлено для совместимости
         * с текущим app.js.
         *
         * На данном этапе отдельные
         * расходы не используются.
         */

        return;

    }

};


/* ============================================================
   GLOBAL EXPORT
   ============================================================ */

window.LifeGameFinance =
    Finance;


})();