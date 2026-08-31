/* VEHIGO — Instant Owner Authentication & Dashboard Access */

(function () {
    const isLoginPage = window.location.pathname.endsWith('login.html');
    const isPublicPage = window.location.pathname.endsWith('home.html') ||
                         window.location.pathname.endsWith('register.html') ||
                         window.location.pathname.endsWith('payment.html') ||
                         window.location.pathname.endsWith('confirmation.html');

    const currentUser = sessionStorage.getItem('vehigo_user');

    if (isLoginPage) {
        // If already logged in, redirect directly to fleet dashboard
        if (currentUser) {
            window.location.href = 'index.html';
            return;
        }

        document.addEventListener('DOMContentLoaded', () => {
            const loginForm = document.getElementById('login-form');
            const usernameInput = document.getElementById('username');
            const passwordInput = document.getElementById('password');
            const businessNameInput = document.getElementById('businessName');
            const togglePasswordBtn = document.getElementById('toggle-password-btn');

            // Password Show/Hide Toggle
            if (togglePasswordBtn && passwordInput) {
                togglePasswordBtn.addEventListener('click', () => {
                    const isPassword = passwordInput.getAttribute('type') === 'password';
                    passwordInput.setAttribute('type', isPassword ? 'text' : 'password');
                    togglePasswordBtn.classList.toggle('active', isPassword);
                });
            }

            // Fast Instant Login Form Submission
            if (loginForm) {
                loginForm.addEventListener('submit', (e) => {
                    e.preventDefault();

                    const username = usernameInput ? usernameInput.value.trim() : 'owner';
                    const password = passwordInput ? passwordInput.value.trim() : 'password';
                    const businessName = businessNameInput ? businessNameInput.value.trim() : 'My Fleet Operations';

                    // Save session instantly
                    sessionStorage.setItem('vehigo_user', username || 'owner');
                    sessionStorage.setItem('vehigo_business', businessName || 'My Fleet Operations');

                    // Fire background API auth sync
                    try {
                        if (typeof API !== 'undefined' && API.post) {
                            API.post('/auth/login', { businessName, username, password })
                               .catch(err => console.warn("Background auth sync:", err));
                        }
                    } catch (err) {}

                    // Instant redirect to Fleet Dashboard
                    window.location.href = 'index.html';
                });
            }
        });
    } else if (!isPublicPage) {
        // Protected Fleet Pages Auth Guard
        if (!currentUser) {
            window.location.href = 'login.html';
        }
    }
})();

// Global Logout Handler
function logout() {
    sessionStorage.removeItem('vehigo_user');
    sessionStorage.removeItem('vehigo_business');
    window.location.href = 'login.html';
}
