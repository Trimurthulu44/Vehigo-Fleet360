/* VEHIGO — Demo Payment Checkout Logic & UPI QR Scanner */

let activeSubscriptionId = 'DEMO-SUB-ID';
let currentAmountFormatted = '₹4,999';

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

    const qrAmtDisplay = document.getElementById('qr-amount-display');
    if (qrAmtDisplay) {
        qrAmtDisplay.textContent = currentAmountFormatted;
    }

    // Radio Selection Highlight
    const radioInputs = document.querySelectorAll('input[name="payMethod"]');
    radioInputs.forEach(radio => {
        radio.addEventListener('change', () => {
            document.querySelectorAll('.payment-method-card').forEach(card => card.classList.remove('active'));
            radio.closest('.payment-method-card')?.classList.add('active');
        });
    });
});

// Global Function Handler for Form Submit & Proceed Button
function handleProceedPayment(e) {
    if (e) e.preventDefault();

    const upiModal = document.getElementById('upi-qr-modal');
    const qrAmtDisplay = document.getElementById('qr-amount-display');
    const selectedRadio = document.querySelector('input[name="payMethod"]:checked');
    const payMethod = selectedRadio ? selectedRadio.value : 'DEMO_UPI';

    if (payMethod === 'DEMO_UPI' || payMethod === 'DEMO_UPI_QR') {
        if (upiModal) {
            const amtText = document.getElementById('pay-amount')?.textContent || currentAmountFormatted;
            if (qrAmtDisplay) qrAmtDisplay.textContent = amtText;
            upiModal.style.display = 'flex';
        } else {
            confirmQrPayment();
        }
    } else {
        confirmQrPayment();
    }
}

// Global Function Handler for QR Modal Payment Confirmation
async function confirmQrPayment() {
    closeQrModal();
    showToast("Processing payment verification...", "success");

    const subId = activeSubscriptionId || sessionStorage.getItem('last_sub_id') || 'DEMO-SUB-ID';

    try {
        if (subId && subId !== 'DEMO-SUB-ID') {
            await API.post(`/subscriptions/${subId}/payment`, {
                paymentMethod: 'DEMO_UPI_QR',
                transactionId: 'UPI-TXN-' + Math.floor(Math.random() * 1000000)
            });
        }
    } catch (error) {
        console.warn("Payment API call fallback:", error);
    }

    showToast("Payment Successful! Activating account...", "success");
    setTimeout(() => {
        window.location.href = `confirmation.html?id=${subId}`;
    }, 800);
}

// Global Function Handler to Close Modal
function closeQrModal() {
    const upiModal = document.getElementById('upi-qr-modal');
    if (upiModal) {
        upiModal.style.display = 'none';
    }
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
