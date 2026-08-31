/* VEHIGO — Super Fast & Simple Payment Checkout */

let activeSubscriptionId = 'DEMO-SUB-ID';

document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    activeSubscriptionId = urlParams.get('id') || sessionStorage.getItem('last_sub_id') || 'DEMO-SUB-ID';

    const subIdInput = document.getElementById('subscription-id');
    if (subIdInput) {
        subIdInput.value = activeSubscriptionId;
    }

    if (activeSubscriptionId && activeSubscriptionId !== 'DEMO-SUB-ID') {
        try {
            const sub = await API.get(`/subscriptions/${activeSubscriptionId}`);
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
            console.warn("Details load fallback:", error);
        }
    }
});

// Fast Instant Payment & Activation Handler
function handleProceedPayment(e) {
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }

    const subId = activeSubscriptionId || sessionStorage.getItem('last_sub_id') || 'DEMO-SUB-ID';

    // Fire async backend payment activation
    try {
        if (typeof API !== 'undefined' && API.post && subId !== 'DEMO-SUB-ID') {
            API.post(`/subscriptions/${subId}/payment`, {
                paymentMethod: 'RAZORPAY_FAST',
                transactionId: 'TXN-' + Math.floor(Math.random() * 1000000)
            }).catch(err => console.warn("Background payment sync:", err));
        }
    } catch (err) {}

    // Instant Redirect to Confirmation Screen
    window.location.href = `confirmation.html?id=${subId}`;
    return false;
}

function confirmQrPayment() {
    return handleProceedPayment(null);
}

function closeQrModal() {
    const upiModal = document.getElementById('upi-qr-modal');
    if (upiModal) upiModal.style.display = 'none';
}

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
