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

// ============================================
// Mortgage Rates API Integration
// ============================================

const RATES_API_URL = 'https://realestate-api.aastha-dahal.workers.dev/api/rates';

// Cache for mortgage rates
let cachedRates = null;
let ratesCacheTime = null;
const RATES_CACHE_DURATION = 60 * 60 * 1000; // 1 hour

/**
 * Fetch current mortgage rates from API
 * Returns { thirtyYear: number, fifteenYear: number, source: string, lastUpdated: string }
 */
async function fetchMortgageRates() {
    // Return cached rates if fresh
    if (cachedRates && ratesCacheTime && (Date.now() - ratesCacheTime < RATES_CACHE_DURATION)) {
        return cachedRates;
    }

    try {
        const response = await fetch(RATES_API_URL);
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();

        cachedRates = {
            thirtyYear: data.rates.thirtyYear.rate,
            fifteenYear: data.rates.fifteenYear.rate,
            source: data.source,
            lastUpdated: data.lastUpdated,
            isLive: !data.error
        };
        ratesCacheTime = Date.now();

        return cachedRates;

    } catch (error) {
        console.error('Failed to fetch mortgage rates:', error);

        // Return fallback rates
        return {
            thirtyYear: 6.5,
            fifteenYear: 5.9,
            source: 'Fallback (offline)',
            lastUpdated: new Date().toISOString(),
            isLive: false
        };
    }
}

/**
 * Update an interest rate input field with live rates
 * @param {HTMLInputElement} inputElement - The input to update
 * @param {string} rateType - 'thirtyYear' or 'fifteenYear'
 * @param {HTMLElement} [statusElement] - Optional element to show rate source
 */
async function updateRateInput(inputElement, rateType = 'thirtyYear', statusElement = null) {
    try {
        const rates = await fetchMortgageRates();
        const rate = rates[rateType];

        if (rate && inputElement) {
            inputElement.value = rate.toFixed(2);
            inputElement.setAttribute('data-live-rate', 'true');
        }

        if (statusElement) {
            const dateStr = rates.lastUpdated
                ? new Date(rates.lastUpdated).toLocaleDateString()
                : 'Unknown';
            statusElement.innerHTML = rates.isLive
                ? `<span class="rate-live">Live rate as of ${dateStr}</span>`
                : `<span class="rate-fallback">Estimated rate</span>`;
        }

    } catch (error) {
        console.error('Error updating rate input:', error);
    }
}
