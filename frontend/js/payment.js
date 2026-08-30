/* VEHIGO — Demo Payment Checkout Logic */

document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const subscriptionId = urlParams.get('id');

    if (!subscriptionId) {
        showToast("No subscription ID found. Returning to home.", "error");
        setTimeout(() => window.location.href = 'home.html', 2000);
        return;
    }

    document.getElementById('subscription-id').value = subscriptionId;

    try {
        const sub = await API.get(`/subscriptions/${subscriptionId}`);
        if (sub) {
            document.getElementById('pay-business').textContent = sub.businessName;
            document.getElementById('pay-email').textContent = sub.ownerEmail;
            document.getElementById('pay-plan').textContent = formatPlanName(sub.selectedPlan);
            document.getElementById('pay-amount').textContent = formatCurrency(sub.amount);
        }
    } catch (error) {
        console.error("Failed to load subscription details:", error);
    }

    // Payment Form Submission
    const payForm = document.getElementById('payment-form');
    if (payForm) {
        payForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const payMethod = document.querySelector('input[name="payMethod"]:checked')?.value || 'DEMO_CARD';

            try {
                showToast("Processing demo payment...", "success");
                const response = await API.post(`/subscriptions/${subscriptionId}/payment`, {
                    paymentMethod: payMethod,
                    transactionId: 'TXN-' + Math.floor(Math.random() * 1000000)
                });

                if (response && response.subscriptionStatus === 'ACTIVE') {
                    showToast("Payment Successful! Subscription Activated.", "success");
                    setTimeout(() => {
                        window.location.href = `confirmation.html?id=${subscriptionId}`;
                    }, 1000);
                }
            } catch (error) {
                console.error("Payment failed:", error);
                showToast("Payment failed. Please try again.", "error");
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
