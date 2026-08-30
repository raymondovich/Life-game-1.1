// =====================================================
// LIFE GAME
// HEALTH SECTION
// =====================================================
//
// Модуль здоровья.
//
// Этот файл загружается отдельно от index.html.
//
// API:
//
// window.LifeGameHealth.progress(state)
// window.LifeGameHealth.page(state)
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
    // HEALTH PROGRESS
    // =================================================

    function progress(state) {

        if (
            !state ||
            !state.categories ||
            !state.categories.health
        ) {

            return 0;

        }


        const health =
            state.categories.health;


        // Режим дня
        const routine =
            clamp(
                health.routine,
                0,
                100
            );


        // Питание
        const nutrition =
            clamp(
                health.nutrition,
                0,
                100
            );


        // Шаги.
        // Цель — 10 000 шагов.

        const steps =
            clamp(
                num(health.steps) /
                10000 *
                100,
                0,
                100
            );


        return Math.round(
            (
                routine +
                nutrition +
                steps
            ) / 3
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
    // HEALTH PAGE
    // =================================================

    function page(
        state
    ) {

        if (
            !state ||
            !state.categories ||
            !state.categories.health
        ) {

            return `

                <div class="notice">

                    Данные здоровья
                    недоступны.

                </div>

            `;

        }


        const health =
            state.categories.health;


        const p =
            progress(state);


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
            Math.max(
                0,
                num(
                    health.steps
                )
            );


        const stepsPercent =
            clamp(
                steps /
                10000 *
                100,
                0,
                100
            );


        return `

            <!-- =========================================
                 SUMMARY
            ========================================== -->

            <div class="summary">

                <div class="section-label">

                    HEALTH LEVEL ${num(
                        health.level
                    )}

                </div>


                <div class="summary-number">

                    ${p}%

                </div>


                <div class="progress">

                    <i
                        style="
                            width:${clamp(
                                p,
                                0,
                                100
                            )}%;
                        "
                    ></i>

                </div>


                <div class="finance-box">

                    <div class="finance-line">

                        <span>
                            HEALTH XP
                        </span>

                        <strong>
                            ${fmt(
                                health.xp
                            )} XP
                        </strong>

                    </div>


                    <div class="finance-line">

                        <span>
                            STREAK
                        </span>

                        <strong>
                            🔥 ${num(
                                health.streak
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
                    '⏰',
                    'Режим дня',
                    fmt(routine) + '%',
                    '100%',
                    routine,
                    'routine'
                )}


                ${metric(
                    '🍎',
                    'Питание',
                    fmt(nutrition) + '%',
                    '100%',
                    nutrition,
                    'nutrition'
                )}


                ${metric(
                    '🚶',
                    'Шаги',
                    fmt(steps),
                    '10 000',
                    stepsPercent,
                    'steps'
                )}


                <div class="notice">

                    Прогресс здоровья
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
    // EDITOR LABELS
    // =================================================

    const labels = {

        routine:
            'Режим дня (%)',

        nutrition:
            'Питание (%)',

        steps:
            'Шаги'


    };


    // =================================================
    // CAN EDIT
    // =================================================

    function canEdit(id) {

        return Object.prototype.hasOwnProperty.call(
            labels,
            id
        );

    }


    // =================================================
    // PUBLIC API
    // =================================================

    window.LifeGameHealth = {

        progress: progress,

        page: page,

        labels: labels,

        canEdit: canEdit

    };


    // =================================================
    // DEBUG
    // =================================================

    console.log(
        'LIFE GAME: Health module loaded'
    );


})();