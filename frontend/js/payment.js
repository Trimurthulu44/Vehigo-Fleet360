/* VEHIGO — Demo Payment Checkout Logic */

document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const subscriptionId = urlParams.get('id');

    if (!subscriptionId) {
        showToast("No subscription ID found. Returning to home.", "error");
        setTimeout(() => window.location.href = 'home.html', 2000);
        return;
    }

    const subIdInput = document.getElementById('subscription-id');
    if (subIdInput) {
        subIdInput.value = subscriptionId;
    }

    try {
        const sub = await API.get(`/subscriptions/${subscriptionId}`);
        if (sub) {
            const bizEl = document.getElementById('pay-business');
            const emailEl = document.getElementById('pay-email');
            const planEl = document.getElementById('pay-plan');
            const amtEl = document.getElementById('pay-amount');

            if (bizEl) bizEl.textContent = sub.businessName || 'N/A';
            if (emailEl) emailEl.textContent = sub.ownerEmail || 'N/A';
            if (planEl) planEl.textContent = formatPlanName(sub.selectedPlan);
            if (amtEl) amtEl.textContent = formatCurrency(sub.amount);
        }
    } catch (error) {
        console.error("Failed to load subscription details:", error);
    }

    // Payment Form Submission
    const payForm = document.getElementById('payment-form');
    if (payForm) {
        payForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const selectedRadio = document.querySelector('input[name="payMethod"]:checked');
            const payMethod = selectedRadio ? selectedRadio.value : 'DEMO_CARD';

            try {
                showToast("Processing demo payment...", "success");
                const response = await API.post(`/subscriptions/${subscriptionId}/payment`, {
                    paymentMethod: payMethod,
                    transactionId: 'TXN-' + Math.floor(Math.random() * 1000000)
                });

                if (response && (response.subscriptionStatus === 'ACTIVE' || response.paymentStatus === 'SUCCESS')) {
                    showToast("Payment Successful! Subscription Activated.", "success");
                    setTimeout(() => {
                        window.location.href = `confirmation.html?id=${subscriptionId}`;
                    }, 800);
                } else {
                    window.location.href = `confirmation.html?id=${subscriptionId}`;
                }
            } catch (error) {
                console.error("Payment failed:", error);
                showToast(error.message || "Payment failed. Please try again.", "error");
            }
        });
    }
});

function formatPlanName(plan) {
    if (!plan) return '1 Year Plan';
    switch (plan.toUpperCase()) {
        case '6_MONTH': return '6 Month Plan (₹2,999)';
        case '1_YEAR': return '1 Year Plan (₹4,999)';
        case '3_YEAR': return '3 Year Plan (₹11,999)';
        case '5_YEAR': return '5 Year Plan (₹17,999)';
        default: return plan;
    }
}
