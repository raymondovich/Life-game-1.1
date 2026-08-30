// =====================================================
// LIFE GAME
// HEALTH SECTION
// =====================================================

(function () {

    'use strict';

    function num(value) {
        const n = Number(value);
        return Number.isFinite(n) ? n : 0;
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

        const sleep =
            clamp(
                num(health.sleep),
                0,
                100
            );

        const sport =
            clamp(
                num(health.sport),
                0,
                100
            );

        const nutrition =
            clamp(
                num(health.nutrition),
                0,
                100
            );

        const water =
            clamp(
                num(health.water),
                0,
                100
            );

        return Math.round(
            (
                sleep +
                sport +
                nutrition +
                water
            ) / 4
        );
    }


    // =================================================
    // METRIC
    // =================================================

    function metric(
        icon,
        title,
        value,
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
                                ${esc(value)}
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

    function page(
        state,
        ui
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

        const totalProgress =
            progress(state);


        const sleep =
            clamp(
                num(health.sleep),
                0,
                100
            );

        const sport =
            clamp(
                num(health.sport),
                0,
                100
            );

        const nutrition =
            clamp(
                num(health.nutrition),
                0,
                100
            );

        const water =
            clamp(
                num(health.water),
                0,
                100
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
                 HEALTH METRICS
            ========================================== -->

            <div class="cards">

                ${metric(
                    '😴',
                    'Сон',
                    `${sleep}%`,
                    sleep,
                    'sleep'
                )}

                ${metric(
                    '🏃',
                    'Физическая активность',
                    `${sport}%`,
                    sport,
                    'sport'
                )}

                ${metric(
                    '🥗',
                    'Питание',
                    `${nutrition}%`,
                    nutrition,
                    'nutrition'
                )}

                ${metric(
                    '💧',
                    'Вода',
                    `${water}%`,
                    water,
                    'water'
                )}


                <div class="notice">

                    Поддерживай показатели
                    здоровья каждый день,
                    чтобы увеличивать
                    свой прогресс.

                </div>


                <a
                    class="creator"
                    href="https://t.me/shkeltinsh"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Created by
                    <strong>
                        @shkeltinsh
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