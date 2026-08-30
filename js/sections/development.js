(function(){

'use strict';


/* =====================================================
   LIFE GAME — DEVELOPMENT MODULE
   ===================================================== */

window.LifeGameDevelopment = {


    /* ===================================================
       PROGRESS
       =================================================== */

    progress:function(state){

        const x =
            state.categories.development;


        const books =
            x.books >= 2
                ? 100
                : Math.round(
                    x.books / 2 * 100
                );


        const language =
            x.languageMinutes >= 30
                ? 100
                : Math.round(
                    x.languageMinutes / 30 * 100
                );


        const meditation =
            x.meditationMinutes >= 15
                ? 100
                : Math.round(
                    x.meditationMinutes / 15 * 100
                );


        return Math.round(
            (
                books +
                language +
                meditation
            ) / 3
        );

    },


    /* ===================================================
       PAGE
       =================================================== */

    page:function(state, helpers){

        const x =
            state.categories.development;


        const p =
            this.progress(state);


        const metric =
            helpers.metric;


        const fmt =
            helpers.fmt;


        const clamp =
            helpers.clamp;


        const esc =
            helpers.esc;


        const creatorHTML =
            helpers.creatorHTML;


        const body =

            metric(
                '📚',
                'Чтение книг',
                fmt(x.books),
                '2',
                clamp(
                    Math.round(
                        x.books / 2 * 100
                    ),
                    0,
                    100
                ),
                'books'
            ) +


            metric(
                '🌐',
                'Изучение языка',
                fmt(
                    x.languageMinutes
                ) + ' мин',
                '30 мин',
                clamp(
                    Math.round(
                        x.languageMinutes / 30 * 100
                    ),
                    0,
                    100
                ),
                'languageMinutes'
            ) +


            metric(
                '🧘',
                'Медитация',
                fmt(
                    x.meditationMinutes
                ) + ' мин',
                '15 мин',
                clamp(
                    Math.round(
                        x.meditationMinutes / 15 * 100
                    ),
                    0,
                    100
                ),
                'meditationMinutes'
            );


        return `

            <div class="summary">

                <div class="section-label">
                    DEVELOPMENT LEVEL
                    ${x.level}
                </div>


                <div class="summary-number">
                    ${p}%
                </div>


                <div class="progress">

                    <i
                        style="width:${clamp(
                            p,
                            0,
                            100
                        )}%"
                    ></i>

                </div>


                <div class="finance-box">

                    <div class="finance-line">

                        <span>
                            DEVELOPMENT XP
                        </span>

                        <strong>
                            ${fmt(x.xp)} XP
                        </strong>

                    </div>


                    <div class="finance-line">

                        <span>
                            STREAK
                        </span>

                        <strong>
                            🔥 ${x.streak}
                        </strong>

                    </div>

                </div>

            </div>


            <div class="cards">

                ${body}


                <div class="notice">

                    Прогресс сохраняется
                    автоматически.

                    Повышение уровня XP
                    происходит сразу после
                    изменения показателя
                    или выполнения действия.

                </div>


                ${creatorHTML()}

            </div>

        `;

    },


    /* ===================================================
       EDITOR LABELS
       =================================================== */

    labels:{

        books:
            'Книги',

        languageMinutes:
            'Минуты изучения языка',

        meditationMinutes:
            'Минуты медитации'

    },


    /* ===================================================
       CHECK
       =================================================== */

    canEdit:function(id){

        return Object.prototype.hasOwnProperty.call(
            this.labels,
            id
        );

    }

};


console.log(
    'LIFE GAME: development.js loaded'
);

})();