/* VEHIGO — Instant Seamless Owner Authentication & Dashboard Access */

(function () {
    const isLoginPage = window.location.pathname.endsWith('login.html');
    const isPublicPage = window.location.pathname.endsWith('home.html') ||
                         window.location.pathname.endsWith('register.html') ||
                         window.location.pathname.endsWith('payment.html') ||
                         window.location.pathname.endsWith('confirmation.html');

    let currentUser = sessionStorage.getItem('vehigo_user') || localStorage.getItem('vehigo_user');

    if (isLoginPage) {
        document.addEventListener('DOMContentLoaded', () => {
            const loginForm = document.getElementById('login-form');
            const usernameInput = document.getElementById('username');
            const passwordInput = document.getElementById('password');
            const businessNameInput = document.getElementById('businessName');
            const togglePasswordBtn = document.getElementById('toggle-password-btn');

            // Pre-fill registered credentials if available
            const lastRegUser = sessionStorage.getItem('last_reg_user') || localStorage.getItem('last_reg_user');
            const lastRegBiz = sessionStorage.getItem('last_reg_biz') || localStorage.getItem('last_reg_biz');
            if (usernameInput && lastRegUser) usernameInput.value = lastRegUser;
            if (businessNameInput && lastRegBiz) businessNameInput.value = lastRegBiz;

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

                    const username = (usernameInput?.value || 'Fleet Owner').trim();
                    const password = (passwordInput?.value || 'password').trim();
                    const businessName = (businessNameInput?.value || lastRegBiz || 'My Fleet Operations').trim();

                    // Save session in both sessionStorage and localStorage for seamless persistence
                    sessionStorage.setItem('vehigo_user', username);
                    sessionStorage.setItem('vehigo_business', businessName);
                    localStorage.setItem('vehigo_user', username);
                    localStorage.setItem('vehigo_business', businessName);

                    // Instant 0ms transition to Fleet Management Dashboard
                    window.location.href = 'index.html';
                });
            }
        });
    } else if (!isPublicPage) {
        // Guarantee access to inside Fleet Management Dashboard
        if (!currentUser) {
            currentUser = 'Fleet Owner';
            sessionStorage.setItem('vehigo_user', currentUser);
            sessionStorage.setItem('vehigo_business', 'My Fleet Operations');
            localStorage.setItem('vehigo_user', currentUser);
            localStorage.setItem('vehigo_business', 'My Fleet Operations');
        }
    }
})();

// Global Logout Handler
function logout() {
    sessionStorage.removeItem('vehigo_user');
    sessionStorage.removeItem('vehigo_business');
    localStorage.removeItem('vehigo_user');
    localStorage.removeItem('vehigo_business');
    window.location.href = 'login.html';
}
