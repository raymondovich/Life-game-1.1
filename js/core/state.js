// LIFE GAME
// CORE STATE
// Центральное состояние приложения

export const DEFAULT_STATE = {
    version: 3,

    player: {
        xp: 0,
        level: 1,
        rating: 0,
        premiumBonusXP: 0
    },

    categories: {

        finance: {
            xp: 0,
            level: 1,
            streak: 0,
            bestStreak: 0,
            monthlyIncome: 0,
            monthlyGoal: 100000,
            yearlyGoal: 1200000,
            savings: 0
        },

        training: {
            xp: 0,
            level: 1,
            streak: 0,
            bestStreak: 0,
            workouts: 0,
            monthlyTarget: 12
        },

        development: {
            xp: 0,
            level: 1,
            streak: 0,
            bestStreak: 0,
            books: 0,
            languageMinutes: 0,
            meditationMinutes: 0
        },

        health: {
            xp: 0,
            level: 1,
            streak: 0,
            bestStreak: 0,
            routine: 0,
            nutrition: 0,
            steps: 0
        },

        discipline: {
            xp: 0,
            level: 1,
            streak: 0,
            bestStreak: 0,
            completed: 0,
            failed: 0
        }
    },

    simulator: {
        currentMonth: 1,
        months: 120,
        history: []
    },

    quests: [
        {
            id: 'finance_income',
            category: 'finance',
            title: 'Зафиксировать доход за месяц',
            xp: 35,
            done: false
        },

        {
            id: 'training',
            category: 'training',
            title: 'Выполнить тренировку',
            xp: 30,
            done: false
        },

        {
            id: 'development',
            category: 'development',
            title: '30 минут развития',
            xp: 25,
            done: false
        },

        {
            id: 'health',
            category: 'health',
            title: 'Выполнить полезную привычку',
            xp: 20,
            done: false
        }
    ]
};


// Глубокая копия объекта
export function cloneState(value) {
    return JSON.parse(
        JSON.stringify(value)
    );
}


// Создать новое состояние по умолчанию
export function createDefaultState() {
    return cloneState(
        DEFAULT_STATE
    );
}