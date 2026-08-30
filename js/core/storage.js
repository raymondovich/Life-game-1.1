```javascript
// LIFE GAME
// CORE STORAGE
// Работа с localStorage

import {
    createDefaultState
} from './state.js';

const SK = 'life_game_core_v3';
const EK = 'life_game_expenses_v3';
const UK = 'life_game_ui_v1';


// ================================
// STATE
// ================================

export function loadState(normalize) {

    try {

        const raw =
            localStorage.getItem(SK);

        if (!raw) {
            return createDefaultState();
        }

        const parsed =
            JSON.parse(raw);

        return normalize
            ? normalize(parsed)
            : parsed;

    } catch (error) {

        console.error(
            'LIFE GAME: failed to load state',
            error
        );

        return createDefaultState();

    }

}


// ================================
// EXPENSES
// ================================

export function loadExpenses() {

    try {

        const raw =
            localStorage.getItem(EK);

        const data =
            JSON.parse(raw || '[]');

        if (!Array.isArray(data)) {
            return [];
        }

        return data.map(expense => ({

            id: String(
                expense.id ||
                Date.now() +
                Math.random()
            ),

            name: String(
                expense.name || ''
            ),

            amount: Math.max(
                0,
                Number(expense.amount) || 0
            )

        }));

    } catch (error) {

        console.error(
            'LIFE GAME: failed to load expenses',
            error
        );

        return [];

    }

}


// ================================
// UI
// ================================

export function loadUI() {

    try {

        const raw =
            localStorage.getItem(UK);

        const data =
            JSON.parse(raw || '{}');

        return {

            expensesCollapsed:
                Boolean(
                    data.expensesCollapsed
                )

        };

    } catch (error) {

        console.error(
            'LIFE GAME: failed to load UI settings',
            error
        );

        return {

            expensesCollapsed:
                false

        };

    }

}


// ================================
// SAVE
// ================================

export function saveState(state) {

    localStorage.setItem(
        SK,
        JSON.stringify(state)
    );

}


export function saveExpenses(expenses) {

    localStorage.setItem(
        EK,
        JSON.stringify(expenses)
    );

}


export function saveUI(ui) {

    localStorage.setItem(
        UK,
        JSON.stringify(ui)
    );

}


// ================================
// SAVE EVERYTHING
// ================================

export function saveAll(
    state,
    expenses,
    ui
) {

    saveState(state);
    saveExpenses(expenses);
    saveUI(ui);

}
```
