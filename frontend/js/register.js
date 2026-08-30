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
    const errorBox = document.getElementById('register-error');

    if (regForm) {
        regForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (errorBox) errorBox.style.display = 'none';

            const payload = {
                businessName: document.getElementById('businessName').value.trim(),
                businessType: document.getElementById('businessType').value,
                businessRegNumber: document.getElementById('businessRegNumber').value.trim(),
                vehicleCount: parseInt(document.getElementById('vehicleCount').value) || 5,
                location: document.getElementById('location').value.trim(),
                ownerName: document.getElementById('ownerName').value.trim(),
                ownerEmail: document.getElementById('ownerEmail').value.trim(),
                phone: document.getElementById('phone').value.trim(),
                selectedPlan: document.getElementById('selected-plan-input').value,
                username: document.getElementById('username').value.trim(),
                password: document.getElementById('password').value.trim()
            };

            try {
                const response = await API.post('/subscriptions/register', payload);
                if (response && response.id) {
                    window.location.href = `payment.html?id=${response.id}`;
                }
            } catch (error) {
                console.error("Registration failed:", error);
                if (errorBox) {
                    errorBox.textContent = error.message || "Registration failed. Please check your inputs.";
                    errorBox.style.display = 'block';
                }
            }
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
