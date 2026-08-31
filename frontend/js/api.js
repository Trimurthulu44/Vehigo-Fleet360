/* Centralized API Client for VEHIGO SaaS Platform */

// Dynamic Production API URL Resolver:
// 1. If running on localhost / 127.0.0.1 -> use local Spring Boot server (http://localhost:8080/api)
// 2. If running on GitHub Pages / Cloud domain -> use live Koyeb backend URL or custom window override
const getApiBaseUrl = () => {
    if (window.VEHIGO_BACKEND_URL) {
        return window.VEHIGO_BACKEND_URL.replace(/\/$/, '') + '/api';
    }
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') {
        return 'http://localhost:8080/api';
    }
    // Replace this placeholder with your live Render backend URL after deploying on Render
    return 'https://vehigo-fleet360-1.onrender.com/api';
};

const API_BASE_URL = getApiBaseUrl();

const API = {
    async request(endpoint, options = {}) {
        const url = `${API_BASE_URL}${endpoint}`;
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers,
        };

        const config = {
            ...options,
            headers,
        };

        try {
            const response = await fetch(url, config);

            // Handle HTTP 204 No Content
            if (response.status === 204) {
                return null;
            }

            const data = await response.json();

            if (!response.ok) {
                const errorMessage = data.message || data.error || 'API Request Failed';
                showToast(errorMessage, 'error');
                throw new Error(errorMessage);
            }

            return data;
        } catch (error) {
            console.error(`API Error [${endpoint}]:`, error);
            if (error.name === 'TypeError' && error.message.includes('Fetch')) {
                showToast('Unable to connect to Spring Boot backend server. Please check deployment or server status.', 'error');
            }
            throw error;
        }
    },

    get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    },

    post(endpoint, body) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(body)
        });
    },

    put(endpoint, body) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(body)
        });
    },

    delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }
};

// UI Toast Notification Helper
function showToast(message, type = 'success') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// Utility Formatters
function getStatusBadgeClass(status) {
    if (!status) return 'badge-inactive';
    const s = status.toUpperCase();
    if (s === 'AVAILABLE' || s === 'COMPLETED') return 'badge-available';
    if (s === 'ON_TRIP' || s === 'IN_PROGRESS') return 'badge-ontrip';
    if (s === 'MAINTENANCE' || s === 'SCHEDULED' || s === 'PLANNED') return 'badge-maintenance';
    return 'badge-inactive';
}

function formatDate(dateStr) {
    if (!dateStr) return 'N/A';
    try {
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch (e) {
        return dateStr;
    }
}

function formatCurrency(amount) {
    if (amount == null) return '₹0.00';
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
}
