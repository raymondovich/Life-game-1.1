```javascript
// LIFE GAME
// CORE UTILITIES
// Общие вспомогательные функции


// ========================================
// NUMBER
// ========================================

export function num(value) {

    return Number.isFinite(
        Number(value)
    )
        ? Number(value)
        : 0;

}


// ========================================
// CLAMP
// ========================================

export function clamp(
    value,
    min,
    max
) {

    return Math.min(
        max,
        Math.max(
            min,
            num(value)
        )
    );

}


// ========================================
// FORMAT NUMBER
// ========================================

export function fmt(value) {

    return new Intl.NumberFormat(
        'ru-RU'
    ).format(
        num(value)
    );

}


// ========================================
// ESCAPE HTML
// ========================================

export function esc(value) {

    return String(value).replace(
        /[&<>"']/g,
        character => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        }[character])
    );

}


// ========================================
// PERCENTAGE
// ========================================

export function percent(
    value,
    target,
    allowOver100 = false
) {

    const v =
        target > 0
            ? Math.round(
                num(value) /
                num(target) *
                100
            )
            : 0;

    return allowOver100
        ? Math.max(0, v)
        : clamp(v, 0, 100);

}


// ========================================
// DEEP CLONE
// ========================================

export function clone(value) {

    return JSON.parse(
        JSON.stringify(value)
    );

}


// ========================================
// SAFE STRING
// ========================================

export function safeString(
    value,
    fallback = ''
) {

    if (
        value === null ||
        value === undefined
    ) {

        return fallback;

    }

    return String(value);

}


// ========================================
// SAFE POSITIVE NUMBER
// ========================================

export function positiveNumber(
    value
) {

    return Math.max(
        0,
        num(value)
    );

}
```
