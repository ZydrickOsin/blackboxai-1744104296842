/**
 * SariBooks - Shared JavaScript Functions
 * Contains common functionality used across the application
 */

// Format currency (PHP)
function formatCurrency(amount) {
    return '₱' + parseFloat(amount).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
}

// Format percentage
function formatPercentage(amount) {
    return parseFloat(amount).toFixed(2) + '%';
}

// Initialize sidebar toggle functionality
function initSidebar() {
    const sidebarToggle = document.getElementById('sidebarToggle');
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', function() {
            document.querySelector('.sidebar').classList.toggle('collapsed');
            document.querySelector('.main-content').classList.toggle('ml-64');
            document.querySelector('.main-content').classList.toggle('ml-20');
        });
    }
}

// Initialize logout functionality
function initLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            localStorage.removeItem('isLoggedIn');
            window.location.href = 'index.html';
        });
    }
}

// Check if user is logged in
function checkAuth() {
    if (!localStorage.getItem('isLoggedIn') && !window.location.pathname.endsWith('index.html')) {
        window.location.href = 'index.html';
    }
}

// Initialize common functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initSidebar();
    initLogout();
    checkAuth();
    
    // Set current year in tax year selector
    const taxYear = document.getElementById('taxYear');
    if (taxYear) {
        taxYear.value = new Date().getFullYear();
    }
    
    // Set today's date in date inputs
    const dateInputs = document.querySelectorAll('input[type="date"]');
    if (dateInputs.length > 0) {
        const today = new Date().toISOString().split('T')[0];
        dateInputs.forEach(input => {
            if (!input.value) {
                input.value = today;
            }
        });
    }
});

// Show toast notification
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `fixed bottom-4 right-4 px-6 py-3 rounded-md shadow-lg text-white ${
        type === 'success' ? 'bg-green-500' : 
        type === 'error' ? 'bg-red-500' : 
        'bg-blue-500'
    }`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('opacity-0', 'transition-opacity', 'duration-300');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Validate email format
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
}

// Calculate Philippine BIR tax for individuals
function calculateIndividualTax(netIncome) {
    if (netIncome <= 250000) return 0;
    if (netIncome <= 400000) return (netIncome - 250000) * 0.15;
    if (netIncome <= 800000) return 22500 + (netIncome - 400000) * 0.20;
    if (netIncome <= 2000000) return 102500 + (netIncome - 800000) * 0.25;
    if (netIncome <= 8000000) return 402500 + (netIncome - 2000000) * 0.30;
    return 2202500 + (netIncome - 8000000) * 0.35;
}

// Calculate Philippine BIR tax for corporations
function calculateCorporateTax(netIncome, grossRevenue) {
    const corporateTax = netIncome * 0.30;
    const percentageTax = grossRevenue * 0.03;
    const withholdingTax = grossRevenue * 0.02;
    return corporateTax + percentageTax + withholdingTax;
}

// Export functions for testing/modularity
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        formatCurrency,
        formatPercentage,
        calculateIndividualTax,
        calculateCorporateTax,
        validateEmail
    };
}