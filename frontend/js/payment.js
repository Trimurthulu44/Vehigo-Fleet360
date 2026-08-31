/* VEHIGO — Demo Payment Checkout Logic */

document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    let subscriptionId = urlParams.get('id') || sessionStorage.getItem('last_sub_id') || 'DEMO-SUB-ID';

    const subIdInput = document.getElementById('subscription-id');
    if (subIdInput) {
        subIdInput.value = subscriptionId;
    }

    if (subscriptionId && subscriptionId !== 'DEMO-SUB-ID') {
        try {
            const sub = await API.get(`/subscriptions/${subscriptionId}`);
            if (sub) {
                const bizEl = document.getElementById('pay-business');
                const emailEl = document.getElementById('pay-email');
                const planEl = document.getElementById('pay-plan');
                const amtEl = document.getElementById('pay-amount');

                if (bizEl) bizEl.textContent = sub.businessName || 'Registered Fleet Business';
                if (emailEl) emailEl.textContent = sub.ownerEmail || 'owner@vehigo.com';
                if (planEl) planEl.textContent = formatPlanName(sub.selectedPlan);
                if (amtEl) amtEl.textContent = formatCurrency(sub.amount);
            }
        } catch (error) {
            console.error("Failed to load subscription details:", error);
        }
    }

    // Payment Form Submission (Always Attached)
    const payForm = document.getElementById('payment-form');
    if (payForm) {
        payForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const selectedRadio = document.querySelector('input[name="payMethod"]:checked');
            const payMethod = selectedRadio ? selectedRadio.value : 'DEMO_CARD';

            showToast("Processing demo payment...", "success");

            try {
                if (subscriptionId && subscriptionId !== 'DEMO-SUB-ID') {
                    await API.post(`/subscriptions/${subscriptionId}/payment`, {
                        paymentMethod: payMethod,
                        transactionId: 'TXN-' + Math.floor(Math.random() * 1000000)
                    });
                }
            } catch (error) {
                console.warn("Payment API call fallback:", error);
            }

            // Always Proceed to Confirmation Page
            showToast("Payment Successful! Activating account...", "success");
            setTimeout(() => {
                window.location.href = `confirmation.html?id=${subscriptionId}`;
            }, 800);
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
