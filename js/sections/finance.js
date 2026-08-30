// =====================================================
// LIFE GAME
// FINANCE SECTION
// =====================================================
//
// Финансовый модуль.
// Этот файл загружается отдельно от index.html.
//
// API:
//
// window.LifeGameFinance.progress(state, expenses)
// window.LifeGameFinance.page(state, expenses, ui)
//
// =====================================================

(function () {

    'use strict';


    // =================================================
    // HELPERS
    // =================================================

    function num(value) {

        const n = Number(value);

        return Number.isFinite(n)
            ? n
            : 0;

    }


    function clamp(value, min, max) {

        return Math.min(
            max,
            Math.max(
                min,
                num(value)
            )
        );

    }


    function fmt(value) {

        return new Intl.NumberFormat(
            'ru-RU'
        ).format(
            num(value)
        );

    }


    function esc(value) {

        return String(value).replace(
            /[&<>"']/g,
            function (character) {

                return {
                    '&': '&amp;',
                    '<': '&lt;',
                    '>': '&gt;',
                    '"': '&quot;',
                    "'": '&#039;'

                }[character];

            }
        );

    }


    // =================================================
    // FINANCE PROGRESS
    // =================================================

    function progress(
        state,
        expenses
    ) {

        if (
            !state ||
            !state.categories ||
            !state.categories.finance
        ) {

            return 0;

        }


        const finance =
            state.categories.finance;


        const income =
            Math.max(
                0,
                num(
                    finance.monthlyIncome
                )
            );


        const monthlyGoal =
            Math.max(
                1,
                num(
                    finance.monthlyGoal
                )
            );


        const yearlyGoal =
            Math.max(
                1,
                num(
                    finance.yearlyGoal
                )
            );


        const savings =
            Math.max(
                0,
                num(
                    finance.savings
                )
            );


        // Доход относительно месячной цели
        const incomeProgress =
            clamp(
                income /
                monthlyGoal *
                100,
                0,
                100
            );


        // Годовая цель
        const yearlyProgress =
            clamp(
                income * 12 /
                yearlyGoal *
                100,
                0,
                100
            );


        // Накопления
        const savingsTarget =
            Math.max(
                monthlyGoal,
                1
            );


        const savingsProgress =
            clamp(
                savings /
                savingsTarget *
                100,
                0,
                100
            );


        // Расходы
        const list =
            Array.isArray(expenses)
                ? expenses
                : [];


        const totalExpenses =
            list.reduce(
                function (
                    total,
                    expense
                ) {

                    return total +
                        Math.max(
                            0,
                            num(
                                expense.amount
                            )
                        );

                },
                0
            );


        // Расходы относительно дохода.
        // Чем меньше доля расходов,
        // тем лучше показатель.

        let expenseProgress = 100;


        if (income > 0) {

            const expenseRatio =
                totalExpenses /
                income *
                100;


            expenseProgress =
                clamp(
                    100 -
                    expenseRatio,
                    0,
                    100
                );

        }


        return Math.round(
            (
                incomeProgress +
                yearlyProgress +
                savingsProgress +
                expenseProgress
            ) / 4
        );

    }


    // =================================================
    // METRIC
    // =================================================

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
                                ${esc(title)}
                            </strong>

                            <span>
                                ${esc(current)}
                                /
                                ${esc(target)}
                            </span>

                        </div>

                    </div>


                    <div class="metric-percent">
                        ${clamp(
                            percent,
                            0,
                            100
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
                                data-edit="${esc(
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


    // =================================================
    // FINANCE PAGE
    // =================================================

    function page(
        state,
        expenses,
        ui
    ) {

        if (
            !state ||
            !state.categories ||
            !state.categories.finance
        ) {

            return `

                <div class="notice">
                    Финансовые данные
                    недоступны.
                </div>

            `;

        }


        const finance =
            state.categories.finance;


        const list =
            Array.isArray(expenses)
                ? expenses
                : [];


        const income =
            Math.max(
                0,
                num(
                    finance.monthlyIncome
                )
            );


        const monthlyGoal =
            Math.max(
                1,
                num(
                    finance.monthlyGoal
                )
            );


        const yearlyGoal =
            Math.max(
                1,
                num(
                    finance.yearlyGoal
                )
            );


        const savings =
            Math.max(
                0,
                num(
                    finance.savings
                )
            );


        const totalExpenses =
            list.reduce(
                function (
                    total,
                    expense
                ) {

                    return total +
                        Math.max(
                            0,
                            num(
                                expense.amount
                            )
                        );

                },
                0
            );


        const incomePercent =
            clamp(
                income /
                monthlyGoal *
                100,
                0,
                100
            );


        const yearlyPercent =
            clamp(
                income * 12 /
                yearlyGoal *
                100,
                0,
                100
            );


        const savingsPercent =
            clamp(
                savings /
                monthlyGoal *
                100,
                0,
                100
            );


        const totalProgress =
            progress(
                state,
                list
            );


        const expensesHTML =
            list.length
                ? list.map(
                    function (expense) {

                        return `

                            <div
                                class="expense-swipe"
                                data-id="${esc(
                                    expense.id
                                )}"
                            >

                                <div class="expense">

                                    <div>

                                        <strong>
                                            ${esc(
                                                expense.name
                                            )}
                                        </strong>

                                        <span>
                                            Расход
                                        </span>

                                    </div>


                                    <div>

                                        <strong>
                                            −${fmt(
                                                expense.amount
                                            )} ₽
                                        </strong>

                                        <button
                                            class="expense-edit"
                                            data-id="${esc(
                                                expense.id
                                            )}"
                                        >
                                            ✎
                                        </button>

                                    </div>

                                </div>

                            </div>

                        `;

                    }
                ).join('')
                : `

                    <div class="notice">

                        Расходов пока нет.

                    </div>

                `;


        return `

            <!-- =========================================
                 SUMMARY
            ========================================== -->

            <div class="summary">

                <div class="section-label">
                    FINANCE LEVEL ${num(
                        finance.level
                    )}
                </div>


                <div class="summary-number">
                    ${totalProgress}%
                </div>


                <div class="progress">

                    <i
                        style="
                            width:${totalProgress}%;
                        "
                    ></i>

                </div>


                <div class="finance-box">

                    <div class="finance-line">

                        <span>
                            FINANCE XP
                        </span>

                        <strong>
                            ${fmt(
                                finance.xp
                            )} XP
                        </strong>

                    </div>


                    <div class="finance-line">

                        <span>
                            STREAK
                        </span>

                        <strong>
                            🔥 ${num(
                                finance.streak
                            )}
                        </strong>

                    </div>

                </div>

            </div>


            <!-- =========================================
                 METRICS
            ========================================== -->

            <div class="cards">


                ${metric(
                    '💵',
                    'Заработано за месяц',
                    fmt(income) + ' ₽',
                    fmt(monthlyGoal) + ' ₽',
                    incomePercent,
                    'income'
                )}


                ${metric(
                    '🎯',
                    'Цель на год',
                    fmt(income * 12) + ' ₽',
                    fmt(yearlyGoal) + ' ₽',
                    yearlyPercent,
                    'yearlyGoal'
                )}


                ${metric(
                    '💰',
                    'Накопления',
                    fmt(savings) + ' ₽',
                    fmt(monthlyGoal) + ' ₽',
                    savingsPercent,
                    'savings'
                )}


                <!-- =====================================
                     EXPENSES
                ====================================== -->

                <div class="metric">

                    <div class="metric-head">

                        <div class="metric-left">

                            <div class="metric-icon">
                                📉
                            </div>

                            <div class="metric-text">

                                <strong>
                                    Расходы
                                </strong>

                                <span>
                                    ${fmt(
                                        totalExpenses
                                    )} ₽
                                </span>

                            </div>

                        </div>


                        <div class="metric-percent">

                            ${income > 0
                                ? Math.round(
                                    totalExpenses /
                                    income *
                                    100
                                )
                                : 0
                            }%

                        </div>

                    </div>


                    <div class="metric-bar">

                        <i
                            style="
                                width:${income > 0
                                    ? clamp(
                                        totalExpenses /
                                        income *
                                        100,
                                        0,
                                        100
                                    )
                                    : 0
                                }%;
                            "
                        ></i>

                    </div>


                    <button
                        class="edit"
                        id="addExpense"
                    >
                        ＋ ДОБАВИТЬ РАСХОД
                    </button>

                </div>


                <!-- =====================================
                     EXPENSES LIST
                ====================================== -->

                <div class="expenses">

                    <div
                        class="expenses-head"
                        id="expensesToggle"
                    >

                        <span>
                            ИСТОРИЯ РАСХОДОВ
                        </span>

                        <strong>
                            ${
                                ui &&
                                ui.expensesCollapsed
                                    ? '＋'
                                    : '−'
                            }
                        </strong>

                    </div>


                    ${
                        ui &&
                        ui.expensesCollapsed
                            ? ''
                            : expensesHTML
                    }

                </div>


                <div class="notice">

                    Финансовый прогресс
                    рассчитывается автоматически.

                    Изменения сохраняются
                    автоматически.

                </div>


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


            </div>

        `;

    }


    // =================================================
    // PUBLIC API
    // =================================================

    window.LifeGameFinance = {

        progress: progress,

        page: page

    };


    // =================================================
    // DEBUG
    // =================================================

    console.log(
        'LIFE GAME: Finance module loaded'
    );


})();