// ==========================================
// HEALTH.JS - Модуль управления здоровьем
// ==========================================

// Состояние здоровья
let healthState = {
    health: 50,
    healthRoutine: 50,
    healthNutrition: 50,
    healthSteps: 5000,
    trainingWorkouts: 0,
    trainingMonthlyTarget: 12,
    trainingLevel: 1
};

// Инициализация
function initHealth() {
    loadHealthData();
    updateHealthUI();
}

// Загрузка данных
function loadHealthData() {
    const saved = localStorage.getItem('healthData');
    if (saved) {
        try {
            const data = JSON.parse(saved);
            Object.assign(healthState, data);
        } catch (e) {
            console.warn('Ошибка загрузки данных здоровья');
        }
    }
}

// Сохранение данных
function saveHealthData() {
    localStorage.setItem('healthData', JSON.stringify(healthState));
}

// --- Основные механики ---
function increaseHealth() {
    const oldHealth = healthState.health;
    healthState.health = Math.min(100, healthState.health + 5);
    if (healthState.health !== oldHealth) {
        addXP(15);
        showToast('❤️ +5 здоровья');
        updateHealthUI();
        updateLifeProgressUI();
    } else {
        showToast('⚠️ Здоровье уже максимальное');
    }
}

function decreaseHealth() {
    const oldHealth = healthState.health;
    healthState.health = Math.max(0, healthState.health - 5);
    if (healthState.health !== oldHealth) {
        showToast('💔 -5 здоровья');
        updateHealthUI();
        updateLifeProgressUI();
    } else {
        showToast('⚠️ Здоровье уже минимальное');
    }
}

function updateHealthRoutine(value) {
    healthState.healthRoutine = Math.min(100, Math.max(0, value));
    addXP(5);
    updateHealthUI();
    showToast('⏰ Режим дня обновлен');
}

function updateHealthNutrition(value) {
    healthState.healthNutrition = Math.min(100, Math.max(0, value));
    addXP(5);
    updateHealthUI();
    showToast('🍎 Питание обновлено');
}

function updateHealthSteps(value) {
    healthState.healthSteps = Math.min(100000, Math.max(0, value));
    addXP(3);
    updateHealthUI();
    showToast('🚶 Шаги обновлены');
}

function completeWorkout() {
    healthState.trainingWorkouts++;
    const xpGain = Math.round(80 / Math.pow(Math.max(1, healthState.trainingLevel), 0.58));
    addXP(xpGain);
    updateHealthUI();
    showToast(`🏋️ Тренировка выполнена! +${xpGain} XP`);
}

// --- Обновление UI ---
function updateHealthUI() {
    const healthPercent = Math.min(100, Math.max(0, healthState.health));
    const routinePercent = Math.round(healthState.healthRoutine);
    const nutritionPercent = Math.round(healthState.healthNutrition);
    const stepsPercent = Math.round((healthState.healthSteps / 10000) * 100);
    const workoutPercent = Math.round((healthState.trainingWorkouts / healthState.trainingMonthlyTarget) * 100);

    // Обновляем главный экран
    const healthFill = document.getElementById('healthFill');
    const healthPercentEl = document.getElementById('healthPercent');
    if (healthFill) healthFill.style.width = healthPercent + '%';
    if (healthPercentEl) healthPercentEl.textContent = healthPercent + '%';

    // Обновляем страницу здоровья, если она открыта
    const page = document.getElementById('activePage');
    if (page && page.querySelector('[data-category="health"]')) {
        updateHealthPageUI(healthPercent, routinePercent, nutritionPercent, stepsPercent, workoutPercent);
    }

    saveHealthData();
}

function updateHealthPageUI(health, routine, nutrition, steps, workout) {
    const page = document.getElementById('activePage');
    if (!page) return;

    // Обновляем summary
    const summaryNumber = page.querySelector('.summary-number');
    if (summaryNumber) {
        summaryNumber.textContent = health + '%';
        summaryNumber.style.color = health > 60 ? '#4CAF50' : health > 30 ? '#FFA726' : '#ff6b6b';
    }

    const progressBar = page.querySelector('.summary .progress i');
    if (progressBar) {
        progressBar.style.width = health + '%';
        progressBar.style.background = health > 60 ? '#4CAF50' : health > 30 ? '#FFA726' : '#ff6b6b';
    }

    // Обновляем метрики
    const metrics = page.querySelectorAll('.metric');
    if (metrics.length >= 4) {
        // Режим дня
        const routineMetric = metrics[0];
        if (routineMetric) {
            routineMetric.querySelector('.metric-percent').textContent = routine + '%';
            routineMetric.querySelector('.metric-bar i').style.width = routine + '%';
            routineMetric.querySelector('.metric-text span').textContent = routine + '% / 100%';
        }

        // Питание
        const nutritionMetric = metrics[1];
        if (nutritionMetric) {
            nutritionMetric.querySelector('.metric-percent').textContent = nutrition + '%';
            nutritionMetric.querySelector('.metric-bar i').style.width = nutrition + '%';
            nutritionMetric.querySelector('.metric-text span').textContent = nutrition + '% / 100%';
        }

        // Шаги
        const stepsMetric = metrics[2];
        if (stepsMetric) {
            stepsMetric.querySelector('.metric-percent').textContent = steps + '%';
            stepsMetric.querySelector('.metric-bar i').style.width = steps + '%';
            stepsMetric.querySelector('.metric-text span').textContent = healthState.healthSteps + ' шагов / 10 000 шагов';
        }

        // Тренировки
        const workoutMetric = metrics[3];
        if (workoutMetric) {
            workoutMetric.querySelector('.metric-percent').textContent = workout + '%';
            workoutMetric.querySelector('.metric-bar i').style.width = workout + '%';
            workoutMetric.querySelector('.metric-text span').textContent = 
                healthState.trainingWorkouts + ' из ' + healthState.trainingMonthlyTarget + ' / ' + healthState.trainingMonthlyTarget + ' за месяц';
        }
    }
}

// --- Глобальные обработчики для страницы ---
window.handleWorkout = function() {
    completeWorkout();
    if (typeof openCategoryPage === 'function') {
        openCategoryPage('health');
    }
};

window.handleHealthEdit = function(type) {
    const labels = {
        routine: 'Введите новый процент режима дня (0-100):',
        nutrition: 'Введите новый процент питания (0-100):',
        steps: 'Введите количество шагов:'
    };
    
    const current = {
        routine: healthState.healthRoutine,
        nutrition: healthState.healthNutrition,
        steps: healthState.healthSteps
    };
    
    const value = prompt(labels[type] || 'Введите значение:', current[type].toString());
    if (value && !isNaN(value) && Number(value) >= 0) {
        switch(type) {
            case 'routine':
                updateHealthRoutine(Number(value));
                break;
            case 'nutrition':
                updateHealthNutrition(Number(value));
                break;
            case 'steps':
                updateHealthSteps(Number(value));
                break;
        }
        if (typeof openCategoryPage === 'function') {
            openCategoryPage('health');
        }
    }
};

// Инициализация
document.addEventListener('DOMContentLoaded', function() {
    initHealth();
});

// Экспорт для использования в других модулях
window.healthState = healthState;
window.increaseHealth = increaseHealth;
window.decreaseHealth = decreaseHealth;
window.completeWorkout = completeWorkout;
window.updateHealthUI = updateHealthUI;