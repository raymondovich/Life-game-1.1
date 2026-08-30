```javascript
// LIFE GAME
// CORE XP SYSTEM
// Расчёт уровней и опыта


// ========================================
// XP REQUIRED FOR LEVEL
// ========================================

export function xpForLevel(level) {

    return Math.round(
        100 *
        Math.pow(
            Math.max(1, Number(level) || 1),
            1.42
        )
    );

}


// ========================================
// LEVEL FROM XP
// ========================================

export function levelFromXP(xp) {

    let level = 1;

    const value =
        Math.max(
            0,
            Number(xp) || 0
        );

    while (
        value >= xpForLevel(level + 1) &&
        level < 10000
    ) {

        level++;

    }

    return level;

}


// ========================================
// CALCULATE PLAYER XP
// ========================================

export function playerXPFromCategoryXP(
    amount
) {

    return Math.round(
        (
            Number(amount) || 0
        ) * 0.65
    );

}


// ========================================
// STREAK MULTIPLIER
// ========================================

export function streakMultiplier(
    streak
) {

    return 1 +
        (
            Math.max(
                0,
                Number(streak) || 0
            ) * 0.08
        );

}


// ========================================
// XP WITH STREAK
// ========================================

export function xpWithStreak(
    baseXP,
    streak
) {

    return Math.round(
        (
            Number(baseXP) || 0
        ) *
        streakMultiplier(streak)
    );

}
```
