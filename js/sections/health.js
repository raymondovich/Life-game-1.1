// =====================================================
// LIFE GAME
// HEALTH SECTION
// =====================================================

(function () {

    'use strict';


    // =================================================
    // HELPERS
    // =================================================

    function num(value) {

        return Number.isFinite(Number(value))
            ? Number(value)
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
    // Сохраняем текущую рабочую механику
    // =================================================

    function progress(state) {

        if (
            !state ||
            !state.categories
        ) {

            return 0;

        }


        const health =
            state.categories.health;

        const training =
            state.categories.training;


        if (
            !health ||
            !training
        ) {

            return 0;

        }


        const healthPart =
            (
                clamp(
                    num(health.routine),
                    0,
                    100
                ) +

                clamp(
                    num(health.nutrition),
                    0,
                    100
                ) +

                clamp(
                    Math.round(
                        num(health.steps) /
                        10000 *
                        100
                    ),
                    0,
                    100
                )
            ) / 3;


        const trainingPart =
            num(training.monthlyTarget) > 0

                ? clamp(
                    Math.round(
                        num(training.workouts) /
                        num(training.monthlyTarget) *
                        100
                    ),
                    0,
                    100
                )

                : 0;


        return Math.round(
            (
                healthPart +
                trainingPart
            ) / 2
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
                                data-edit="${esc(edit)}"
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

    function page(state) {

        if (
            !state ||
            !state.categories ||
            !state.categories.health ||
            !state.categories.training
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

        const training =
            state.categories.training;


        const totalProgress =
            progress(state);


        const routine =
            clamp(
                num(health.routine),
                0,
                100
            );


        const nutrition =
            clamp(
                num(health.nutrition),
                0,
                100
            );


        const steps =
            Math.max(
                0,
                num(health.steps)
            );


        const workouts =
            Math.max(
                0,
                num(training.workouts)
            );


        const monthlyTarget =
            Math.max(
                1,
                num(training.monthlyTarget)
            );


        const workoutProgress =
            clamp(
                Math.round(
                    workouts /
                    monthlyTarget *
                    100
                ),
                0,
                100
            );


        const workoutXP =
            Math.max(
                5,
                Math.round(
                    80 /
                    Math.pow(
                        Math.max(
                            1,
                            num(training.level)
                        ),
                        .58
                    )
                )
            );


        return `

            <!-- =========================================
                 HEALTH SUMMARY
            ========================================== -->

            <div class="summary">

                <div class="section-label">

                    HEALTH LEVEL ${num(
                        health.level
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
                 TRAINING
            ========================================== -->

            <div class="cards">

                <div class="training-divider">
                    TRAINING
                </div>


                ${metric(
                    '🏋️',
                    'Тренировки',
                    fmt(workouts),
                    fmt(monthlyTarget),
                    workoutProgress,
                    'workouts'
                )}


                <div class="metric">

                    <div class="metric-head">

                        <div class="metric-left">

                            <div class="metric-icon">
                                ⚡
                            </div>

                            <div class="metric-text">

                                <strong>
                                    XP за тренировку
                                </strong>

                                <span>
                                    Чем выше уровень,
                                    тем сложнее прокачка
                                </span>

                            </div>

                        </div>


                        <div class="metric-percent">
                            +${workoutXP}
                        </div>

                    </div>


                    <button
                        class="edit"
                        id="completeWorkout"
                    >
                        ВЫПОЛНИТЬ ТРЕНИРОВКУ
                    </button>

                </div>


                <!-- =====================================
                     HEALTH
                ====================================== -->

                <div class="training-divider">
                    HEALTH
                </div>


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
                    clamp(
                        Math.round(
                            steps /
                            10000 *
                            100
                        ),
                        0,
                        100
                    ),
                    'steps'
                )}


                <div class="notice">

                    Прогресс тренировок входит
                    в общий показатель здоровья.

                    Все ранее сохранённые
                    тренировки сохраняются.

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

    window.LifeGameHealth = {

        progress: progress,

        page: page

    };


    console.log(
        'LIFE GAME: Health module loaded'
    );

})();