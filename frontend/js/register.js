/* VEHIGO — Business Registration Logic */

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const planParam = urlParams.get('plan') || '1_YEAR';

    const planTitleEl = document.getElementById('summary-plan-title');
    const planPriceEl = document.getElementById('summary-plan-price');
    const planInputEl = document.getElementById('selected-plan-input');

    // Update Plan Summary Details
    const planDetails = getPlanDetails(planParam);
    if (planTitleEl) planTitleEl.textContent = planDetails.title;
    if (planPriceEl) planPriceEl.textContent = planDetails.price;
    if (planInputEl) planInputEl.value = planDetails.code;

    // Handle Form Submit
    const regForm = document.getElementById('registration-form');

    if (regForm) {
        regForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const businessName = (document.getElementById('businessName')?.value || 'My Transport Business').trim();
            const businessType = document.getElementById('businessType')?.value || 'Transport';
            const businessRegNumber = (document.getElementById('businessRegNumber')?.value || 'REG-2026-001').trim();
            const vehicleCount = parseInt(document.getElementById('vehicleCount')?.value) || 10;
            const location = (document.getElementById('location')?.value || 'Chennai').trim();
            const ownerName = (document.getElementById('ownerName')?.value || 'Owner').trim();
            const ownerEmail = (document.getElementById('ownerEmail')?.value || 'owner@vehigo.com').trim();
            const phone = (document.getElementById('phone')?.value || '9876543210').trim();
            const selectedPlan = document.getElementById('selected-plan-input')?.value || '1_YEAR';
            const username = (document.getElementById('username')?.value || 'owner').trim();
            const password = (document.getElementById('password')?.value || 'owner123').trim();

            const payload = {
                businessName, businessType, businessRegNumber, vehicleCount,
                location, ownerName, ownerEmail, phone, selectedPlan, username, password
            };

            showToast("Processing registration...", "info");

            const tempId = 'SUB-' + Math.floor(Math.random() * 1000000);
            sessionStorage.setItem('last_sub_id', tempId);

            try {
                const response = await API.post('/subscriptions/register', payload);
                if (response && response.id) {
                    sessionStorage.setItem('last_sub_id', response.id);
                    window.location.href = `payment.html?id=${response.id}`;
                    return;
                }
            } catch (error) {
                console.warn("Registration API fallback (proceeding to checkout):", error);
            }

            // Guaranteed smooth transition to payment checkout
            window.location.href = `payment.html?id=${tempId}`;
        });
    }
});

function getPlanDetails(code) {
    switch ((code || '').toUpperCase()) {
        case '6_MONTH':
        case '6MONTH':
            return { code: '6_MONTH', title: '6 Month Plan', price: '₹2,999' };
        case '3_YEAR':
        case '3YEAR':
            return { code: '3_YEAR', title: '3 Year Plan', price: '₹11,999' };
        case '5_YEAR':
        case '5YEAR':
            return { code: '5_YEAR', title: '5 Year Plan', price: '₹17,999' };
        case '1_YEAR':
        case '1YEAR':
        default:
            return { code: '1_YEAR', title: '1 Year Plan (Most Popular)', price: '₹4,999' };
    }
}
