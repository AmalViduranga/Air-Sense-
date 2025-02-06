// Base Air Quality Standards Template, defines air quality standards for different metrics
const baseAirQualityStandards = {
    Temperature: { 
        poor: { min: -Infinity, max: 18, unit: '°C' },
        moderate: { min: 18, max: 21.8, unit: '°C' },
        good: { min: 21.8, max: 26.1, unit: '°C' },
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
        good: { min: 500, max: 1500, unit: 'Ω' },
        moderate: { min: 1500, max: 2500, unit: 'Ω' },
        poor: { min: 2500, max: Infinity, unit: 'Ω' }
    },
    'Pressure': {
        good: { min: 980, max: 1020, unit: 'hPa' },
        moderate: { min: 960, max: 980, unit: 'hPa' },
        poor: { min: -Infinity, max: 960, unit: 'hPa' }
    },
    'Nitrogen Dioxide (NO2)': {
        good: { min: 0, max: 110, unit: 'ppb' },
        moderate: { min: 110, max: 130, unit: 'ppb' },
        hazardous: { min: 130, max: Infinity, unit: 'ppb' }
    },
    'Ozone (O3)': {
        good: { min: 0, max: 100, unit: 'ppb' },
        moderate: { min: 100, max: 120, unit: 'ppm' },
        hazardous: { min: 120, max: Infinity, unit: 'ppm' }
    }
};

// Generate Air Quality Standards for all locations, Copies the base standards for different locations where air quality will be measured.
const airQualityStandards = {
    lectureHall: { ...baseAirQualityStandards },
    Office: { ...baseAirQualityStandards },
    Basement: { ...baseAirQualityStandards },
    electronicLab: { ...baseAirQualityStandards }
};
    

//Initializing Variables for Charts & Data
let gaugeCharts = {};//stores gauge charts for displaying air quality.
let distributionChart = null;//represents the trend of air quality over time.
let chartData = { //holds air quality data for two locations being compared.
    location1: [],
    location2: []
};

//Initializing UI and Authentication
document.addEventListener('DOMContentLoaded', function() {
    checkAuthentication(); //Verify if the user is loged in
    initializeUI(); //Setup date pickers, event listeners, and charts
    setupErrorContainers();//Handels error msg s
});

//User authentication check
function checkAuthentication() {
    const username = localStorage.getItem('userName');// Retirives username and location from localStorage
    const location = localStorage.getItem('userLocation');
    
    if (!username || !location) {//Redirects to login page if user is not authenticated
        window.location.href = 'login.html';
        return;
    }
    
    document.getElementById('username-display').textContent = username;//Displays username & location in the UI
    document.getElementById('current-location-display').textContent = location;
}

function initializeUI() {
    setupDatePickers();
    setupEventListeners();
    initializeGauges();
    initializeDistributionChart();
}

//Setting up date pickers
function setupDatePickers() {
    const today = new Date().toISOString().split('T')[0];
    const date1Input = document.getElementById('date1');
    const date2Input = document.getElementById('date2');
    
    date1Input.max = today;
    date2Input.max = today;
    
    date1Input.value = today;
    date2Input.value = today;
date1Input.addEventListener('change', function() {
    const selectedDate = new Date(this.value);
    const currentDate = new Date(today);
    
    // Reset date2 if it's the same as date1
    if (date2Input.value === this.value) {
        date2Input.value = '';
        showError("Please select different dates for comparison");
        clearCharts();
        return;
    }
    
    // Set restrictions for date2
    date2Input.max = today;
    
    // Disable the selected date for date2
    const allDates = getAllDatesInRange(selectedDate, currentDate);
    allDates.forEach(date => {
        if (date.toISOString().split('T')[0] !== this.value) {
            const option = document.createElement('option');
            option.value = date.toISOString().split('T')[0];
            date2Input.appendChild(option);
        }
    });
    
    updateData();
});
date2Input.addEventListener('change', updateData);
}

function getAllDatesInRange(startDate, endDate) {
    const dates = [];
    let currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
        dates.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return dates;
}

function setupEventListeners() {
    ['location1', 'location2', 'metrics1', 'metrics2'].forEach(id => {
        document.getElementById(id).addEventListener('change', function() {
            const metric1 = document.getElementById('metrics1').value;
            const metric2 = document.getElementById('metrics2').value;
            
            if (metric1 !== metric2 && metric1 !== "" && metric2 !== "") {
                showError("Please select the same metric for both locations");
                clearCharts();
                return;
            }
            
            updateData();
        });
    });
}

function initializeGauges() {
    const config = {
        type: 'doughnut',
        data: {
            datasets: [{
                data: [0, 100],
                backgroundColor: ['#28a745', '#e9ecef'],
                borderWidth: 0
            }]
        },
        options: {
            circumference: 180,
            rotation: 270,
            cutout: '70%',
            plugins: {
                tooltip: { enabled: false },
                legend: { display: false }
            },
            responsive: true,
            maintainAspectRatio: false
        }
    };

    ['gauge1', 'gauge2'].forEach(id => {
        const ctx = document.getElementById(id).getContext('2d');
        gaugeCharts[id] = new Chart(ctx, config);
    });
}

  

function initializeDistributionChart() {
    const ctx = document.getElementById('distributionChart').getContext('2d');
    distributionChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                {
                    label: 'Location 1',
                    borderColor: '#007bff',
                    data: []
                },
                {
                    label: 'Location 2',
                    borderColor: '#28a745',
                    data: []
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function getQualityLevel(value, standards) {
    // Iterate through standard levels to determine quality
    for (const level in standards) {
        const range = standards[level];
        if (value >= range.min && value < range.max) {
            return {
                level: level.replace(/\d+$/, ''), // Remove numeric suffixes
                unit: range.unit
            };
        }
    }
    return {
        level: 'poor',
        unit: standards.good.unit
    };
}
function updateGauge(index, value, location, metric) {
    const standards = airQualityStandards[location][metric];
    const qualityInfo = getQualityLevel(value, standards);
    const gaugeChart = gaugeCharts[`gauge${index}`];
    
    // Define colors for different levels
    const colors = {
        good: '#28a745',
        moderate: '#ffc107',
        poor: '#dc3545'
    };
    
    // Calculate percentage fill based on the value within the good range
    const goodRange = standards.good;
    const filledPercentage = Math.min(100, Math.max(0, 
        ((value - goodRange.min) / (goodRange.max - goodRange.min)) * 100
    ));
    
    // Update gauge colors based on quality level
    gaugeChart.data.datasets[0].backgroundColor = [
        colors[qualityInfo.level],
        '#e9ecef'
    ];
    
    // Update gauge value
    gaugeChart.data.datasets[0].data = [filledPercentage, 100 - filledPercentage];
    gaugeChart.update();
    
    // Update value display
    document.getElementById(`gauge${index}-value`).textContent = 
        `${value.toFixed(1)}${qualityInfo.unit}`;
    
    // Update status text and color
    const status = document.getElementById(`status${index}`);
    status.textContent = qualityInfo.level.charAt(0).toUpperCase() + qualityInfo.level.slice(1);
    status.className = `status ${qualityInfo.level}`;
}

function generateMockData(location, metric, date, index) {
    if (!location || !metric) {
        document.getElementById(`status${index}`).textContent = "Select location and metric to view data";
        return;
    }

    const standards = airQualityStandards[location][metric];
    const goodRange = standards.good;
    const value = goodRange.min + (Math.random() * (goodRange.max - goodRange.min));
    
    updateGauge(index, value, location, metric);
    
    // Generate hourly data for distribution chart
    chartData[`location${index}`] = Array.from({length: 24}, () => ({
        value: goodRange.min + (Math.random() * (goodRange.max - goodRange.min)),
        hour: 0
    })).map((data, i) => ({
        value: data.value,
        hour: i
    }));
}



function updateComparison() {
    const location1 = document.getElementById('location1').value;
    const location2 = document.getElementById('location2').value;
    const metric1 = document.getElementById('metrics1').value;
    const metric2 = document.getElementById('metrics2').value;

    if (!location1 || !location2) {
        document.getElementById('comparison-text').textContent = 
            "Select both locations to view comparison";
        return;
    }

    const value1 = parseFloat(document.getElementById('gauge1-value').textContent);
    const value2 = parseFloat(document.getElementById('gauge2-value').textContent);
    const quality1 = document.getElementById('status1').textContent.toLowerCase();
    const quality2 = document.getElementById('status2').textContent.toLowerCase();
    
    const comparisonText = `
        ${location1} shows ${value1.toFixed(1)}${airQualityStandards[location1][metric1].good.unit} 
        for ${metric1} (${quality1}), while ${location2} shows 
        ${value2.toFixed(1)}${airQualityStandards[location2][metric2].good.unit} 
        for ${metric2} (${quality2}).
    `;
    
    document.getElementById('comparison-text').textContent = comparisonText;
}

function updateDistributionChart() {
    const location1 = document.getElementById('location1').value;
    const location2 = document.getElementById('location2').value;
    
    if (!location1 || !location2 || location1 === location2) return;
    
    distributionChart.data.labels = Array.from({length: 24}, (_, i) => `${i}:00`);
    distributionChart.data.datasets[0].data = chartData.location1.map(d => d.value);
    distributionChart.data.datasets[1].data = chartData.location2.map(d => d.value);
    distributionChart.data.datasets[0].label = location1;
    distributionChart.data.datasets[1].label = location2;
    
    distributionChart.update();
}

function updateData() {
    const location1 = document.getElementById('location1').value;
    const location2 = document.getElementById('location2').value;
    const metric1 = document.getElementById('metrics1').value;
    const metric2 = document.getElementById('metrics2').value;
    const date1 = document.getElementById('date1').value;
    const date2 = document.getElementById('date2').value;

    // Check for same locations
    if (location1 === location2 && location1 !== "") {
        showError("Please select different locations for comparison");
        clearCharts();
        return;
    }

    // Check for same dates
    if (date1 === date2 && date1 !== "") {
        showError("Please select different dates for comparison");
        clearCharts();
        return;
    }

    // Check for different metrics
    if (metric1 !== metric2 && metric1 !== "" && metric2 !== "") {
        showError("Please select the same metric for both locations");
        clearCharts();
        return;
    }

    hideError();
    generateMockData(location1, metric1, date1, 1);
    generateMockData(location2, metric2, date2, 2);
    updateComparison();
    updateDistributionChart();
}


    function showError(message) {
        const validationMessage = document.getElementById('validation-message');
        validationMessage.textContent = message;
        validationMessage.style.display = "block";
        
        document.getElementById('comparison-text').textContent = message;
    }
    
    function hideError() {
        document.getElementById('validation-message').style.display = "none";
    }
    
    function clearCharts() {
        document.getElementById('comparison-text').textContent = "Select valid comparison parameters to view summary";
        // Clear gauge charts with neutral colors
        Object.values(gaugeCharts).forEach(gauge => {
            gauge.data.datasets[0].backgroundColor = ['#e9ecef', '#e9ecef', '#e9ecef'];
            gauge.data.datasets[0].data = [0, 0, 100];
            gauge.update();
        });
        
        // Clear distribution chart
        distributionChart.data.datasets.forEach(dataset => {
            dataset.data = [];
        });
        distributionChart.update();
        
        // Clear gauge values
        document.getElementById('gauge1-value').textContent = '--';
        document.getElementById('gauge2-value').textContent = '--';
        
        // Reset status indicators
        const status1 = document.getElementById('status1');
        const status2 = document.getElementById('status2');
        status1.textContent = 'Select location to view data';
        status2.textContent = 'Select location to view data';
        status1.className = 'status';
        status2.className = 'status';
    }
    
    function validateDateSelection(date1, date2) {
        if (!date1 || !date2) return true;
        
        const selectedDate1 = new Date(date1);
        const selectedDate2 = new Date(date2);
        
        // Check if dates are the same
        if (selectedDate1.getTime() === selectedDate2.getTime()) {
            showError("Please select different dates for comparison");
            return false;
        }
        
        // Check if dates are in the future
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (selectedDate1 > today || selectedDate2 > today) {
            showError("Cannot select future dates");
            return false;
        }
        
        return true;
    }
    
    function getRandomValueInRange(min, max) {
        return Math.random() * (max - min) + min;
    }
    
    // Helper function to format date for display
    function formatDate(date) {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(date).toLocaleDateString(undefined, options);
    }
    
    // Function to handle window resize
    window.addEventListener('resize', function() {
        if (distributionChart) {
            distributionChart.resize();
        }
        Object.values(gaugeCharts).forEach(gauge => {
            gauge.resize();
        });
    });
    
    // Export functions for testing if needed
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = {
            validateDateSelection,
            getQualityLevel,
            formatDate,
            getRandomValueInRange
        };
    }