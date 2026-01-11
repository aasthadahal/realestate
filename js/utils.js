// Shared Utility Functions

// Format number as USD currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

// Format number as USD with cents
function formatCurrencyWithCents(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
}

// Parse currency string to number (removes $, commas)
function parseCurrency(value) {
    if (typeof value === 'number') return value;
    return parseFloat(value.replace(/[$,]/g, '')) || 0;
}

// Format number with commas
function formatNumber(num) {
    return new Intl.NumberFormat('en-US').format(num);
}

// Format as percentage
function formatPercent(value, decimals = 2) {
    return value.toFixed(decimals) + '%';
}

// Parse percentage string to decimal (5% -> 0.05)
function parsePercent(value) {
    if (typeof value === 'number') return value / 100;
    return parseFloat(value.replace(/%/g, '')) / 100 || 0;
}

// Calculate monthly mortgage payment (P&I only)
function calculateMonthlyPayment(principal, annualRate, years) {
    const monthlyRate = annualRate / 100 / 12;
    const numPayments = years * 12;

    if (monthlyRate === 0) {
        return principal / numPayments;
    }

    return principal *
        (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
        (Math.pow(1 + monthlyRate, numPayments) - 1);
}

// Calculate total interest paid over loan term
function calculateTotalInterest(principal, monthlyPayment, years) {
    return (monthlyPayment * years * 12) - principal;
}

// Debounce function for input handlers
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Texas county property tax rates (2024 estimates)
const TEXAS_COUNTY_TAX_RATES = {
    'harris': { name: 'Harris County (Houston)', rate: 2.23 },
    'dallas': { name: 'Dallas County', rate: 2.18 },
    'tarrant': { name: 'Tarrant County (Fort Worth)', rate: 2.26 },
    'bexar': { name: 'Bexar County (San Antonio)', rate: 2.23 },
    'travis': { name: 'Travis County (Austin)', rate: 2.11 },
    'collin': { name: 'Collin County', rate: 2.17 },
    'denton': { name: 'Denton County', rate: 2.16 },
    'hidalgo': { name: 'Hidalgo County', rate: 2.15 },
    'fortbend': { name: 'Fort Bend County', rate: 2.48 },
    'williamson': { name: 'Williamson County', rate: 2.21 },
    'montgomery': { name: 'Montgomery County', rate: 2.27 },
    'elpaso': { name: 'El Paso County', rate: 2.53 },
    'cameron': { name: 'Cameron County', rate: 2.05 },
    'nueces': { name: 'Nueces County (Corpus Christi)', rate: 2.24 },
    'brazoria': { name: 'Brazoria County', rate: 2.35 },
    'bell': { name: 'Bell County', rate: 2.38 },
    'galveston': { name: 'Galveston County', rate: 2.32 },
    'lubbock': { name: 'Lubbock County', rate: 2.01 },
    'webb': { name: 'Webb County (Laredo)', rate: 2.38 },
    'jefferson': { name: 'Jefferson County (Beaumont)', rate: 2.28 }
};

// Get all counties as array for dropdowns
function getTexasCounties() {
    return Object.entries(TEXAS_COUNTY_TAX_RATES)
        .map(([key, data]) => ({
            value: key,
            name: data.name,
            rate: data.rate
        }))
        .sort((a, b) => a.name.localeCompare(b.name));
}

// Get tax rate for a county
function getCountyTaxRate(countyKey) {
    const county = TEXAS_COUNTY_TAX_RATES[countyKey];
    return county ? county.rate : 2.20; // Default to ~2.2% if not found
}

// Validate numeric input
function validateNumericInput(value, min = 0, max = Infinity) {
    const num = parseFloat(value);
    if (isNaN(num)) return min;
    return Math.max(min, Math.min(max, num));
}

// Add input formatting (auto-format as currency while typing)
function setupCurrencyInput(inputElement) {
    inputElement.addEventListener('blur', function() {
        const value = parseCurrency(this.value);
        if (value > 0) {
            this.value = formatNumber(value);
        }
    });

    inputElement.addEventListener('focus', function() {
        const value = parseCurrency(this.value);
        if (value > 0) {
            this.value = value;
        }
    });
}

// Smooth scroll to element
function scrollToElement(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}
