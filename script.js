// Глобальные переменные для графиков
let decayChart, chainChart, comparisonChart, discreteChart, energyChart;

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    initializeCharts();
    setupEventListeners();
    updateAllCharts();
});

// Настройка слушателей событий
function setupEventListeners() {
    // Распад
    document.getElementById('n0').addEventListener('input', (e) => {
        document.getElementById('n0-value').textContent = e.target.value;
        updateDecayChart();
        updateEnergyChart();
        updateComparisonChart();
    });
    
    document.getElementById('lambda').addEventListener('input', (e) => {
        const exponent = parseFloat(e.target.value);
        const lambda = Math.pow(10, exponent);
        document.getElementById('lambda-value').textContent = lambda.toExponential(2);
        updateHalflife();
        updateDecayChart();
        updateEnergyChart();
        updateComparisonChart();
    });
    
    document.getElementById('time').addEventListener('input', (e) => {
        document.getElementById('time-value').textContent = e.target.value;
        updateDecayChart();
        updateEnergyChart();
        updateComparisonChart();
    });
    
    // Цепная реакция (непрерывная)
    document.getElementById('k-factor').addEventListener('input', (e) => {
        document.getElementById('k-value').textContent = e.target.value;
        updateChainChart();
        updateComparisonChart();
    });
    
    document.getElementById('tau').addEventListener('input', (e) => {
        document.getElementById('tau-value').textContent = e.target.value;
        updateChainChart();
    });
    
    document.getElementById('initial-neutrons').addEventListener('input', (e) => {
        document.getElementById('neutrons-value').textContent = e.target.value;
        updateChainChart();
    });
    
    document.getElementById('chain-time').addEventListener('input', (e) => {
        document.getElementById('chain-time-value').textContent = e.target.value;
        updateChainChart();
        updateComparisonChart();
    });
    
    // Дискретная модель
    document.getElementById('k-discrete').addEventListener('input', (e) => {
        document.getElementById('k-discrete-value').textContent = e.target.value;
        updateDiscreteChart();
    });
    
    document.getElementById('n0-discrete').addEventListener('input', (e) => {
        document.getElementById('n0-discrete-value').textContent = e.target.value;
        updateDiscreteChart();
    });
    
    document.getElementById('generations').addEventListener('input', (e) => {
        document.getElementById('generations-value').textContent = e.target.value;
        updateDiscreteChart();
    });
    
    // Энергия
    document.getElementById('energy-per-decay').addEventListener('input', (e) => {
        document.getElementById('energy-value').textContent = e.target.value;
        updateEnergyChart();
    });
}

// Инициализация графиков
function initializeCharts() {
    const chartConfig = {
        type: 'line',
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                }
            },
            scales: {
                x: {
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                y: {
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                }
            }
        }
    };
    
    const barConfig = {
        type: 'bar',
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                }
            },
            scales: {
                x: {
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                y: {
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                }
            }
        }
    };
    
    decayChart = new Chart(document.getElementById('decayChart'), {
        ...chartConfig,
        data: { labels: [], datasets: [] }
    });
    
    chainChart = new Chart(document.getElementById('chainChart'), {
        ...chartConfig,
        data: { labels: [], datasets: [] }
    });
    
    discreteChart = new Chart(document.getElementById('discreteChart'), {
        ...barConfig,
        data: { labels: [], datasets: [] }
    });
    
    energyChart = new Chart(document.getElementById('energyChart'), {
        ...chartConfig,
        data: { labels: [], datasets: [] }
    });
    
    comparisonChart = new Chart(document.getElementById('comparisonChart'), {
        ...chartConfig,
        data: { labels: [], datasets: [] }
    });
}

// Обновление периода полураспада и автоматический подбор времени симуляции
function updateHalflife() {
    const exponent = parseFloat(document.getElementById('lambda').value);
    const lambda = Math.pow(10, exponent);
    
    if (isNaN(lambda)) return;

    // Период полураспада в секундах
    const halflifeSec = Math.log(2) / lambda;

    // Для отображения переводим в дни
    const halflifeDays = halflifeSec / 86400;
    document.getElementById('halflife').textContent = halflifeDays.toFixed(2);

    // Подбираем разумное время моделирования: 5 периодов полураспада
    const maxTime = Math.round(5 * halflifeSec);
    document.getElementById('time').value = maxTime;
    document.getElementById('time-value').textContent = maxTime;
}
    

// Расчет радиоактивного распада
function calculateDecay(N0, lambda, maxTime) {
    const points = 100;
    const timeStep = maxTime / points;
    const data = [];
    
    for (let i = 0; i <= points; i++) {
        const t = i * timeStep;
        const N = N0 * Math.exp(-lambda * t);
        data.push({ x: t.toFixed(2), y: N.toFixed(2) });
    }
    
    return data;
}

// Расчет цепной реакции (непрерывная модель)
// N(t) = N0 * exp(α * t), где α = ln(k) / τ
function calculateChainReaction(N0, k, tau, maxTime) {
    const points = 100;
    const timeStep = maxTime / points;
    const data = [];
    
    const alpha = Math.log(k) / tau;
    
    for (let i = 0; i <= points; i++) {
        const t = i * timeStep;
        const N = N0 * Math.exp(alpha * t);
        data.push({ x: t.toFixed(2), y: Math.min(N, 1e6).toFixed(2) }); // Ограничение для визуализации
    }
    
    return data;
}

// Расчет дискретной модели
// N_n = N0 * k^n
function calculateDiscreteModel(N0, k, generations) {
    const data = [];
    
    for (let n = 0; n <= generations; n++) {
        const N = N0 * Math.pow(k, n);
        data.push({ x: n, y: Math.min(N, 1e8) }); // Ограничение для визуализации
    }
    
    return data;
}

// Расчет энергетического выхода
// E_tot(t) = E_один * N0 * (1 - exp(-λt))
function calculateEnergy(N0, lambda, energyPerDecay, maxTime) {
    const points = 100;
    const timeStep = maxTime / points;
    const data = [];
    
    for (let i = 0; i <= points; i++) {
        const t = i * timeStep;
        const decayedNuclei = N0 * (1 - Math.exp(-lambda * t));
        const totalEnergy = energyPerDecay * decayedNuclei;
        data.push({ x: t.toFixed(2), y: totalEnergy.toFixed(2) });
    }
    
    return data;
}

// Обновление графика распада
function updateDecayChart() {
    const N0 = parseFloat(document.getElementById('n0').value);
    const exponent = parseFloat(document.getElementById('lambda').value);
    const lambda = Math.pow(10, exponent);
    const maxTime = parseFloat(document.getElementById('time').value);
    
    const data = calculateDecay(N0, lambda, maxTime);
    
    // Расчет активности A(t) = λ * N(t)
    // Активность имеет ту же форму, что и N(t), только масштабированная
    const activityData = data.map(d => ({
        x: d.x,
        y: (lambda * parseFloat(d.y))
    }));
    
    // Обновление информации
    const finalN = parseFloat(data[data.length - 1].y);
    const decayed = N0 - finalN;
    const currentActivity = lambda * finalN;
    
    document.getElementById('decayed').textContent = Math.round(decayed);
    document.getElementById('activity').textContent = currentActivity.toExponential(2);
    
    decayChart.data.labels = data.map(d => d.x);
    decayChart.data.datasets = [
        {
            label: 'Количество ядер N(t)',
            data: data.map(d => parseFloat(d.y)),
            borderColor: 'rgb(102, 126, 234)',
            backgroundColor: 'rgba(102, 126, 234, 0.1)',
            tension: 0.4,
            fill: true,
            yAxisID: 'y'
        },
        {
            label: 'Активность A(t) (распадов/с)',
            data: activityData.map(d => d.y),
            borderColor: 'rgb(239, 68, 68)',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            tension: 0.4,
            fill: false,
            yAxisID: 'y1'
        }
    ];
    
    // Настройка второй оси Y для активности
    // Масштаб должен быть пропорционален первой оси
    const maxN = Math.max(...data.map(d => parseFloat(d.y)));
    const maxA = lambda * maxN;
    
    decayChart.options.scales.y = {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
            display: true,
            text: 'Количество ядер N(t)'
        },
        grid: {
            color: 'rgba(0, 0, 0, 0.05)'
        }
    };
    
    decayChart.options.scales.y1 = {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
            display: true,
            text: 'Активность A(t) (распадов/с)'
        },
        grid: {
            drawOnChartArea: false
        },
        // Синхронизируем масштаб: если N от 0 до maxN, то A от 0 до maxA
        min: 0,
        max: maxA
    };
    
    decayChart.update();
}

// Обновление графика цепной реакции
function updateChainChart() {
    const N0 = parseFloat(document.getElementById('initial-neutrons').value);
    const k = parseFloat(document.getElementById('k-factor').value);
    const tau = parseFloat(document.getElementById('tau').value);
    const maxTime = parseFloat(document.getElementById('chain-time').value);
    
    // Расчет α = ln(k) / τ
    const alpha = Math.log(k) / tau;
    
    const data = calculateChainReaction(N0, k, tau, maxTime);
    
    // Обновление информации
    document.getElementById('alpha-value').textContent = alpha.toFixed(4);
    
    let regime = 'Критический';
    if (k < 1) regime = 'Подкритический (затухание)';
    else if (k > 1) regime = 'Надкритический (рост)';
    document.getElementById('regime').textContent = regime;
    
    chainChart.data.labels = data.map(d => d.x);
    chainChart.data.datasets = [{
        label: 'Количество нейтронов N(t)',
        data: data.map(d => d.y),
        borderColor: 'rgb(118, 75, 162)',
        backgroundColor: 'rgba(118, 75, 162, 0.1)',
        tension: 0.4,
        fill: true
    }];
    
    chainChart.update();
}

// Обновление графика сравнения
function updateComparisonChart() {
    const N0_decay = parseFloat(document.getElementById('n0').value);
    const exponent = parseFloat(document.getElementById('lambda').value);
    const lambda = Math.pow(10, exponent);
    const maxTime_decay = parseFloat(document.getElementById('time').value);
    
    const N0_chain = parseFloat(document.getElementById('initial-neutrons').value);
    const k = parseFloat(document.getElementById('k-factor').value);
    const tau = parseFloat(document.getElementById('tau').value);
    const maxTime_chain = parseFloat(document.getElementById('chain-time').value);
    
    // Используем общую временную шкалу
    const maxTime = Math.max(maxTime_decay, maxTime_chain);
    
    const decayData = calculateDecay(N0_decay, lambda, maxTime);
    const chainData = calculateChainReaction(N0_chain, k, tau, maxTime);
    
    // Нормализация данных для сравнения
    const normalizeData = (data) => {
        const max = Math.max(...data.map(d => parseFloat(d.y)));
        if (max === 0) return data.map(d => ({ x: d.x, y: 0 }));
        return data.map(d => ({ x: d.x, y: (parseFloat(d.y) / max * 100).toFixed(2) }));
    };
    
    const normalizedDecay = normalizeData(decayData);
    const normalizedChain = normalizeData(chainData);
    
    comparisonChart.data.labels = normalizedDecay.map(d => d.x);
    comparisonChart.data.datasets = [
        {
            label: 'Распад (нормализованный, %)',
            data: normalizedDecay.map(d => d.y),
            borderColor: 'rgb(102, 126, 234)',
            backgroundColor: 'rgba(102, 126, 234, 0.1)',
            tension: 0.4
        },
        {
            label: 'Цепная реакция (нормализованная, %)',
            data: normalizedChain.map(d => d.y),
            borderColor: 'rgb(118, 75, 162)',
            backgroundColor: 'rgba(118, 75, 162, 0.1)',
            tension: 0.4
        }
    ];
    
    comparisonChart.update();
}

// Обновление графика дискретной модели
function updateDiscreteChart() {
    const N0 = parseFloat(document.getElementById('n0-discrete').value);
    const k = parseFloat(document.getElementById('k-discrete').value);
    const generations = parseInt(document.getElementById('generations').value);
    
    const data = calculateDiscreteModel(N0, k, generations);
    
    // Обновление информации
    const finalCount = data[data.length - 1].y;
    const multiplication = finalCount / N0;
    
    document.getElementById('final-count').textContent = finalCount.toExponential(2);
    document.getElementById('multiplication').textContent = multiplication.toExponential(2);
    
    discreteChart.data.labels = data.map(d => `n=${d.x}`);
    discreteChart.data.datasets = [{
        label: 'Количество частиц N_n',
        data: data.map(d => d.y),
        backgroundColor: 'rgba(16, 185, 129, 0.7)',
        borderColor: 'rgb(16, 185, 129)',
        borderWidth: 2
    }];
    
    discreteChart.update();
}

// Обновление графика энергии
function updateEnergyChart() {
    const N0 = parseFloat(document.getElementById('n0').value);
    const exponent = parseFloat(document.getElementById('lambda').value);
    const lambda = Math.pow(10, exponent);
    const maxTime = parseFloat(document.getElementById('time').value);
    const energyPerDecay = parseFloat(document.getElementById('energy-per-decay').value);
    
    const data = calculateEnergy(N0, lambda, energyPerDecay, maxTime);
    
    // Обновление информации
    const totalEnergy = parseFloat(data[data.length - 1].y);
    const power = totalEnergy / maxTime;
    
    document.getElementById('total-energy').textContent = totalEnergy.toExponential(3);
    document.getElementById('power').textContent = power.toExponential(3);
    
    energyChart.data.labels = data.map(d => d.x);
    energyChart.data.datasets = [{
        label: 'Выделенная энергия E_tot(t) (МэВ)',
        data: data.map(d => d.y),
        borderColor: 'rgb(245, 158, 11)',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        tension: 0.4,
        fill: true
    }];
    
    energyChart.update();
}

// Обновление всех графиков
function updateAllCharts() {
    updateHalflife();
    updateDecayChart();
    updateChainChart();
    updateDiscreteChart();
    updateEnergyChart();
    updateComparisonChart();
}
