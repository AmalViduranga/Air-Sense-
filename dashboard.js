const baseAirQualityStandards = {
    AQI: {
        good: { min: 0, max: 66, color: 'good' },
        moderate: { min: 67, max: 99, color: 'moderate' },
        poor: { min: 100, max: Infinity, color: 'poor' }
    },
    Temperature: { 
        poor: { min: -Infinity, max: 18, unit: '°C' },
        moderate: { min: 18, max: 21.8, unit: '°C' },
        good: { min: 21.8, max: 26.10, unit: '°C' },
        moderate2: { min: 26.1, max: 30, unit: '°C' },
        poor2: { min: 30, max: Infinity, unit: '°C' }
    },
    Humidity: {
        poor: { min: -Infinity, max: 20, unit: '%' },
        moderate: { min: 20, max: 30, unit: '%' },
        good: { min: 30, max: 60, unit: '%' },
        moderate2: { min: 60, max: 70, unit: '%' },
        poor2: { min: 70, max: Infinity, unit: '%' }
    },
    'CO2 Level': {
        good: { min: 400, max: 800, unit: 'ppm' },
        moderate: { min: 800, max: 1200, unit: 'ppm' },
        poor: { min: 1200, max: Infinity, unit: 'ppm' }
    },
    'PM2.5': {
        good: { min: 0, max: 100, unit: 'µg/m³' },
        moderate: { min: 100, max: 125, unit: 'µg/m³' },
        poor: { min: 125, max: Infinity, unit: 'µg/m³' }
    },
    'PM10': {
        good: { min: 0, max: 200, unit: 'µg/m³' },
        moderate: { min: 200, max: 250, unit: 'µg/m³' },
        poor: { min: 250, max: Infinity, unit: 'µg/m³' }
    },
    'Gas Resistance': {
        good: { min: 50, max: Infinity, unit: 'kΩ' },
        moderate: { min: 10, max: 50, unit: 'kΩ' },
        poor: { min: 0, max: 10, unit:'kΩ' }
    },
    'Pressure': {
        good: { min: 980, max: 1020, unit: 'hPa' },
        moderate: { min: 960, max: 980, unit: 'hPa' },
        poor: { min: -Infinity, max: 960, unit: 'hPa' }
    },
    'Nitrogen Dioxide (NO2)': {
        good: { min: 0, max: 110, unit: 'ppb' },
        moderate: { min: 110, max: 130, unit: 'ppb' },
        poor: { min: 130, max: Infinity, unit: 'ppb' }
    },
    'Ozone (O3)': {
        good: { min: 0, max: 100, unit: 'ppb' },
        moderate: { min: 100, max: 120, unit: 'ppb' },
        poor: { min: 120, max: Infinity, unit: 'ppb' }
    }
};

const airQualityStandards = {
    // Single location for dashboard
    defaultLocation: { ...baseAirQualityStandards }
};
function calculateAQI(metrics) {
    // AQI calculation based on multiple metrics
    const breakpoints = {
        pm25: [
            {low: 0, high: 12, aqi: {low: 0, high: 50}},
            {low: 12.1, high: 35.4, aqi: {low: 51, high: 100}},
            {low: 35.5, high: 55.4, aqi: {low: 101, high: 150}},
            {low: 55.5, high: 150.4, aqi: {low: 151, high: 200}},
            {low: 150.5, high: 250.4, aqi: {low: 201, high: 300}}
        ],
        co2: [
            {low: 400, high: 600, aqi: {low: 0, high: 50}},
            {low: 601, high: 800, aqi: {low: 51, high: 100}},
            {low: 801, high: 1200, aqi: {low: 101, high: 150}},
            {low: 1201, high: 1600, aqi: {low: 151, high: 200}},
            {low: 1601, high: 2000, aqi: {low: 201, high: 300}}
        ],
        temperature: [
            {low: 22, high: 24, aqi: {low: 0, high: 50}},
            {low: 24.1, high: 26, aqi: {low: 51, high: 100}},
            {low: 26.1, high: 28, aqi: {low: 101, high: 150}}
        ]
    };

    function calculateMetricAQI(value, metricBreakpoints) {
        const matchedBreakpoint = metricBreakpoints.find(bp => 
            value >= bp.low && value <= bp.high
        );

        if (!matchedBreakpoint) return null;

        const { low: concLow, high: concHigh } = matchedBreakpoint;
        const { low: aqiLow, high: aqiHigh } = matchedBreakpoint.aqi;

        const aqi = ((aqiHigh - aqiLow) / (concHigh - concLow)) * (value - concLow) + aqiLow;
        return Math.round(aqi);
    }

    const aqiValues = [
        calculateMetricAQI(metrics.pm25, breakpoints.pm25),
        calculateMetricAQI(metrics.co2, breakpoints.co2),
        calculateMetricAQI(metrics.temperature, breakpoints.temperature)
    ].filter(val => val !== null);

    const averageAQI = aqiValues.length > 0 
        ? Math.round(aqiValues.reduce((a, b) => a + b, 0) / aqiValues.length)
        : 50; // Default to moderate if calculation fails

    return averageAQI;
}

function updateAQIDisplay() {
    const mockMetrics = {
        pm25: 12.5,
        co2: 628,
        temperature: 28
    };

    const aqi = calculateAQI(mockMetrics);
    const aqiElement = document.querySelector('.aqi-card .value');
    const aqiStatusElement = document.querySelector('.aqi-card .status');
    
    aqiElement.textContent = aqi;

    // AQI Status Classification based on baseAirQualityStandards
    const standards = baseAirQualityStandards.AQI;
    let status = '';
    let statusClass = '';

    if (aqi <= standards.good.max) {
        status = 'Good';
        statusClass = 'good';
    } else if (aqi <= standards.moderate.max) {
        status = 'Moderate';
        statusClass = 'moderate';
    } else {
        status = 'Poor';
        statusClass = 'poor';
    }

    aqiStatusElement.textContent = status;
    aqiStatusElement.className = `status ${statusClass}`;
}


document.addEventListener('DOMContentLoaded', function() {
    checkAuthentication();
    initializeDashboard();
    updateAQIDisplay();
  
});

function checkAuthentication() {
    const username = localStorage.getItem('userName');
    const location = localStorage.getItem('userLocation');
    
    if (!username || !location) {
        window.location.href = 'login.html';
        return;
    }
    
    document.getElementById('username-display').textContent = username;
    document.getElementById('current-location-display').textContent = location;
}

function initializeDashboard() {
    const metricsGrid = document.querySelector('.metrics-grid');
    const aqiCard = document.createElement('div');
    aqiCard.className = 'metric-card aqi-card';
    aqiCard.innerHTML = `
        <h3>Air Quality Index (AQI)</h3>
        <div class="gauge-container aqi-gauge">
            <div class="gauge">
                <div class="gauge-fill"></div>
                <div class="gauge-center">
                    <div class="value-display">
                        <div class="value"></div>
                        <div class="unit">AQI</div>
                    </div>
                </div>
            </div>
        </div>
        <div class="status"></div>
    `;
    metricsGrid.appendChild(aqiCard);
    const metrics = [
        'Temperature', 'Humidity', 'PM2.5','PM10', 'CO2 Level', 
        'Pressure', 'Gas Resistance', 
        'Nitrogen Dioxide (NO2)', 'Ozone (O3)'
    ];

    metrics.forEach((metric, index) => {
        const metricCard = createMetricCard(metric, index + 1);
        metricsGrid.appendChild(metricCard);
    });

    initializeCharts();
    updateAQIDisplay();
}

function createMetricCard(metric, index) {
    const card = document.createElement('div');
    card.className = 'metric-card';
    
    const mockValue = generateMockValue(metric);
    const standards = airQualityStandards.defaultLocation[metric];
    const qualityInfo = getQualityLevel(mockValue, standards);

    card.innerHTML = `
        <h3>${metric}</h3>
        <div class="gauge-container">
            <canvas id="gauge${index}"></canvas>
            <div class="value-display">
                <div class="value">${mockValue.toFixed(1)}</div>
                <div class="unit">${qualityInfo.unit}</div>
            </div>
        </div>
        <div class="status ${qualityInfo.level.toLowerCase()}">${qualityInfo.level}</div>
    `;

    return card;
}
    function generateMockValue(metric) {
        const standards = airQualityStandards.defaultLocation[metric];
        let value;
        
        switch(metric) {
            case 'Gas Resistance':
                value = Math.random() * 100;
                break;
            case 'Temperature':
                value = 15 + (Math.random() * 20);
                break;
            case 'Humidity':
                value = Math.random() * 100;
                break;
            case 'CO2 Level':
                value = 400 + (Math.random() * 1600);
                break;
            case 'PM2.5':
                value = Math.random() * 200;
                break;
            case 'PM10':
                value = Math.random() * 300;
                break;
            case 'Pressure':
                value = 950 + (Math.random() * 100);
                break;
            case 'Nitrogen Dioxide (NO2)':
                // Generate whole numbers between 50-200 ppb
                value = Math.floor(50 + (Math.random() * 150));
                break;
            case 'Ozone (O3)':
                // Generate whole numbers between 50-200 ppb
                value = Math.floor(50 + (Math.random() * 150));
                break;
            default:
                value = 50 + (Math.random() * 50);
        }
    
        if (isNaN(value) || !isFinite(value) || value === 0) {
            return 50;
        }
    
        // For NO2 and O3, return whole numbers
        if (metric === 'Nitrogen Dioxide (NO2)' || metric === 'Ozone (O3)') {
            return Math.floor(value);
        }
        
        // For all other metrics, return value with one decimal place
        return Number(value.toFixed(1));
    }
function getQualityLevel(value, standards) {
    for (const level in standards) {
        const range = standards[level];
        if (value >= range.min && value < range.max) {
            return {
                level: level.replace(/\d+$/, ''), // Removes trailing numbers (moderate2 -> moderate)
                unit: range.unit
            };
        }
    }
    return {
        level: 'Poor',
        unit: standards.good.unit
    };
}

function initializeCharts() {
    initializeGaugeCharts();
    initializeTrendsChart();
}
function calculateGaugeFillPercentage(value, metric) {
    const standards = airQualityStandards.defaultLocation[metric];
    if (!standards) return 0;

    const min = standards.good.min; // The lowest defined value
    const max = standards.poor.max; // The highest defined value

    // Ensure value stays within range
    value = Math.max(min, Math.min(value, max));

    // Normalize value to a percentage between 0% and 100%
    return ((value - min) / (max - min)) * 100;
}

function initializeGaugeCharts() {
    const metrics = [
        'Temperature', 'Humidity', 'PM2.5', 'PM10', 'CO2 Level', 
        'Pressure', 'Gas Resistance', 
        'Nitrogen Dioxide (NO2)', 'Ozone (O3)'
    ];

    // Generate a valid mock value for each metric
    function generateValidMockValue(metric) {
        const standards = airQualityStandards.defaultLocation[metric];
        let value;
        
        switch(metric) {
            case 'Gas Resistance':
                value = Math.random() * 100;
                break;
            case 'Temperature':
                value = 15 + (Math.random() * 20);
                break;
            case 'Humidity':
                value = Math.random() * 100;
                break;
            case 'CO2 Level':
                value = 400 + (Math.random() * 1600);
                break;
            case 'PM2.5':
                value = Math.random() * 200;
                break;
            case 'PM10':
                value = Math.random() * 300;
                break;
            case 'Pressure':
                value = 950 + (Math.random() * 100);
                break;
            case 'Nitrogen Dioxide (NO2)':
                // Updated to generate more realistic NO2 values between 0.05 and 0.15 ppm
                value = 50 + (Math.random() * 10);
                break;
            case 'Ozone (O3)':
                // Updated to generate more realistic O3 values between 0.04 and 0.14 ppm
                value = 40 + (Math.random() * 10);
                break;
            default:
                value = 50 + (Math.random() * 50);
        }
    
        if (isNaN(value) || !isFinite(value) || value === 0) {
            return 50;
        }
    
        // For NO2 and O3, use more decimal places since they're measured in small units
        if (metric === 'Nitrogen Dioxide (NO2)' || metric === 'Ozone (O3)') {
            return Number(value.toFixed(3));
        }
        return Number(value.toFixed(1));
    }

    function determineColor(value, metric) {
        const standards = airQualityStandards.defaultLocation[metric];
        
        if (metric === 'Gas Resistance') {
            if (value >= 50) return '#34A853'; // good
            if (value >= 10 && value < 50) return '#FBBC05'; // moderate
            return '#EA4335'; // poor
        }

        for (const [level, range] of Object.entries(standards)) {
            if (value >= range.min && value < range.max) {
                switch(level.replace(/\d+$/, '')) {
                    case 'good': return '#34A853';
                    case 'moderate': return '#FBBC05';
                    case 'poor': return '#EA4335';
                }
            }
        }
        
        return '#EA4335'; // Default to poor if no range matches
    }

    metrics.forEach((metric, index) => {
        const ctx = document.getElementById(`gauge${index + 1}`).getContext('2d');
        const value = generateValidMockValue(metric);
        const qualityLevel = getQualityLevel(value, airQualityStandards.defaultLocation[metric]);
        const color = determineColor(value, metric);
        const fillPercentage = calculateGaugeFillPercentage(value, metric);

        // Update value display
        const card = ctx.canvas.closest('.metric-card');
        if (card) {
            const valueDisplay = card.querySelector('.value');
            if (valueDisplay) {
                valueDisplay.textContent = value;
            }

            const statusDisplay = card.querySelector('.status');
            if (statusDisplay) {
                statusDisplay.textContent = qualityLevel.level;
                statusDisplay.className = `status ${qualityLevel.level.toLowerCase()}`;
            }
        }
        
        
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                datasets: [{
                    data: [value, 100 - value],
                   
                    
                    backgroundColor: [
                        color,
                        '#f5f5f5'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                circumference: 360,
                rotation: 360,
                cutout: '75%',
                plugins: {
                    tooltip: { enabled: false },
                    legend: { display: false }
                },
                animation: {
                    animateRotate: true,
                    animateScale: true
                }
            }
        });
    });
}
function initializeTrendsChart() {
   
    const ctx = document.getElementById('trendsChart').getContext('2d');
    

    const dateFrom = document.getElementById('dateFrom');
    const dateTo = document.getElementById('dateTo');
    const metricSelect = document.getElementById('metricSelect');
    const updateChartButton = document.getElementById('updateChart');
    const metricConfigs = {
        'Temperature': { 
            color: '#e74c3c', 
            unit: '°C',
            label: 'Temperature'
        },
        'Humidity': { 
            color: '#3498db', 
            unit: '%',
            label: 'Humidity'
        },
        'PM2.5': { 
            color: '#34495e', 
            unit: 'µg/m³',
            label: 'PM2.5'
        },
        'PM10': { 
            color: '#ee58cb', 
            unit: 'µg/m³',
            label: 'PM10.0'
        },
        'CO2 Level': { 
            color: '#f1c40f', 
            unit: 'ppm',
            label: 'CO₂ Level'
        },
        'Pressure': { 
            color: '#9b59b6', 
            unit: 'hPa',
            label: 'Pressure'
        },
        'Gas Resistance': { 
            color: '#1abc9c', 
            unit: 'kΩ',
            label: 'Gas Resistance'
        },
        'Nitrogen Dioxide (NO2)': { 
            color: '#e67e22', 
            unit: 'ppb',
            label: 'Nitrogen Dioxide'
        },
        'Ozone (O3)': { 
            color: '#95a5a6', 
            unit: 'ppb',
            label: 'Ozone'
        }
    };
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);
    dateFrom.value = sevenDaysAgo.toISOString().split('T')[0];
    dateTo.value = today.toISOString().split('T')[0];

    let chart = null;
 
    function generateMockTrendsData(metric, fromDate, toDate) {
        const dates = [];
        const values = [];
        const currentDate = new Date(fromDate);
        const endDate = new Date(toDate);
        const standards = airQualityStandards.defaultLocation[metric];
        const goodRange = standards.good;

        while (currentDate <= endDate) {
            dates.push(currentDate.toISOString().split('T')[0]);
            const value = goodRange.min + (Math.random() * (goodRange.max - goodRange.min));
            values.push(Number(value.toFixed(1)));
            currentDate.setDate(currentDate.getDate() + 1);
        }

        return { dates, values };
    }
 
    function updateChart() {
        const metric = metricSelect.value;
        const fromDate = dateFrom.value;
        const toDate = dateTo.value;
        const metricConfig = metricConfigs[metric];
        const { dates, values } = generateMockTrendsData(metric, fromDate, toDate);
        const standards = airQualityStandards.defaultLocation[metric];

        if (chart) {
            chart.destroy();
        }

        chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: dates,
                datasets: [{
                    label:metricConfig.label,
                    data: values,
                    borderColor: metricConfig.color,
                    backgroundColor: `${metricConfig.color}33` ,
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: false,
                        title: {
                            display: true,
                            text:`${metricConfig.label} (${metricConfig.unit})`,
                            font: {
                                size: 14  // Font size for y-axis title
                            }
                        },
                        ticks: {
                            font: {
                                size: 14  // Font size for y-axis labels
                            }
                        }
                    },
                    x: {
                        ticks: {
                            font: {
                                size: 14  // Font size for x-axis labels
                            }
                        }
                    }
                },
                plugins: {
                    legend: {
                        labels: {
                            font: {
                                size: 14  // Font size for legend labels
                            }
                        }
                    },
                    title: {
                        font: {
                            size: 16  // Font size for chart title if you have one
                        }
                    }
                }
            }
        });
    }

    updateChartButton.addEventListener('click', updateChart);
    updateChart();
}
document.addEventListener('DOMContentLoaded', function() {
    initializeTrendsChart();
});