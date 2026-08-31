/* VEHIGO — Demo Payment Checkout Logic & UPI QR Scanner */

document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    let subscriptionId = urlParams.get('id') || sessionStorage.getItem('last_sub_id') || 'DEMO-SUB-ID';

    const subIdInput = document.getElementById('subscription-id');
    if (subIdInput) {
        subIdInput.value = subscriptionId;
    }

    let currentAmountFormatted = '₹4,999';

    if (subscriptionId && subscriptionId !== 'DEMO-SUB-ID') {
        try {
            const sub = await API.get(`/subscriptions/${subscriptionId}`);
            if (sub) {
                const bizEl = document.getElementById('pay-business');
                const emailEl = document.getElementById('pay-email');
                const planEl = document.getElementById('pay-plan');
                const amtEl = document.getElementById('pay-amount');

                currentAmountFormatted = formatCurrency(sub.amount);

                if (bizEl) bizEl.textContent = sub.businessName || 'Registered Fleet Business';
                if (emailEl) emailEl.textContent = sub.ownerEmail || 'owner@vehigo.com';
                if (planEl) planEl.textContent = formatPlanName(sub.selectedPlan);
                if (amtEl) amtEl.textContent = currentAmountFormatted;
            }
        } catch (error) {
            console.error("Failed to load subscription details:", error);
        }
    }

    // Modal Elements
    const upiModal = document.getElementById('upi-qr-modal');
    const qrAmtDisplay = document.getElementById('qr-amount-display');
    const confirmQrBtn = document.getElementById('confirm-qr-pay-btn');
    const closeQrBtn = document.getElementById('close-qr-modal-btn');

    if (qrAmtDisplay) {
        qrAmtDisplay.textContent = currentAmountFormatted;
    }

    // Radio Card Selection Highlight
    const radioInputs = document.querySelectorAll('input[name="payMethod"]');
    radioInputs.forEach(radio => {
        radio.addEventListener('change', () => {
            document.querySelectorAll('.payment-method-card').forEach(card => card.classList.remove('active'));
            radio.closest('.payment-method-card')?.classList.add('active');
        });
    });

    // Payment Form Submission
    const payForm = document.getElementById('payment-form');
    if (payForm) {
        payForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const selectedRadio = document.querySelector('input[name="payMethod"]:checked');
            const payMethod = selectedRadio ? selectedRadio.value : 'DEMO_UPI';

            if (payMethod === 'DEMO_UPI') {
                // Open UPI QR Code Modal Scanner
                if (upiModal) {
                    if (qrAmtDisplay) qrAmtDisplay.textContent = document.getElementById('pay-amount')?.textContent || currentAmountFormatted;
                    upiModal.style.display = 'flex';
                } else {
                    executePayment('DEMO_UPI', subscriptionId);
                }
            } else {
                executePayment(payMethod, subscriptionId);
            }
        });
    }

    // Confirm QR Code Payment Button Handler
    if (confirmQrBtn) {
        confirmQrBtn.addEventListener('click', () => {
            if (upiModal) upiModal.style.display = 'none';
            executePayment('DEMO_UPI_QR', subscriptionId);
        });
    }

    // Close QR Modal Button Handler
    if (closeQrBtn) {
        closeQrBtn.addEventListener('click', () => {
            if (upiModal) upiModal.style.display = 'none';
        });
    }
});

async function executePayment(payMethod, subscriptionId) {
    showToast("Processing payment verification...", "success");

    try {
        if (subscriptionId && subscriptionId !== 'DEMO-SUB-ID') {
            await API.post(`/subscriptions/${subscriptionId}/payment`, {
                paymentMethod: payMethod,
                transactionId: 'UPI-TXN-' + Math.floor(Math.random() * 1000000)
            });
        }
    } catch (error) {
        console.warn("Payment API call fallback:", error);
    }

    showToast("Payment Successful! Activating account...", "success");
    setTimeout(() => {
        window.location.href = `confirmation.html?id=${subscriptionId}`;
    }, 800);
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
