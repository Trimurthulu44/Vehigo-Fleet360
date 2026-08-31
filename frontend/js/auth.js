/* VEHIGO — Demo Authentication & Session Management Module */

(function () {
    const isLoginPage = window.location.pathname.endsWith('login.html');
    const isPublicPage = window.location.pathname.endsWith('home.html') ||
                         window.location.pathname.endsWith('register.html') ||
                         window.location.pathname.endsWith('payment.html') ||
                         window.location.pathname.endsWith('confirmation.html');

    const currentUser = sessionStorage.getItem('vehigo_user');

    if (isLoginPage) {
        // If already logged in, redirect to fleet dashboard
        if (currentUser) {
            window.location.href = 'index.html';
            return;
        }

        // Initialize Login Page Event Listeners after DOM loads
        document.addEventListener('DOMContentLoaded', () => {
            const loginForm = document.getElementById('login-form');
            const usernameInput = document.getElementById('username');
            const passwordInput = document.getElementById('password');
            const businessNameInput = document.getElementById('businessName');
            const togglePasswordBtn = document.getElementById('toggle-password-btn');
            const loginErrorMsg = document.getElementById('login-error');

            // Password Show/Hide Toggle
            if (togglePasswordBtn && passwordInput) {
                togglePasswordBtn.addEventListener('click', () => {
                    const isPassword = passwordInput.getAttribute('type') === 'password';
                    passwordInput.setAttribute('type', isPassword ? 'text' : 'password');
                    togglePasswordBtn.classList.toggle('active', isPassword);
                });
            }

            // Handle Login Form Submission with Strict Error Feedback
            if (loginForm) {
                loginForm.addEventListener('submit', async (e) => {
                    e.preventDefault();
                    if (loginErrorMsg) loginErrorMsg.style.display = 'none';

                    const username = usernameInput.value.trim();
                    const password = passwordInput.value.trim();
                    const businessName = businessNameInput ? businessNameInput.value.trim() : '';

                    if (!username || !password) {
                        showLoginError("Please enter both username and password");
                        return;
                    }

                    try {
                        // Call Backend API Authentication
                        const response = await API.post('/auth/login', {
                            businessName: businessName,
                            username: username,
                            password: password
                        });

                        if (response && response.authenticated) {
                            sessionStorage.setItem('vehigo_user', response.username || username);
                            sessionStorage.setItem('vehigo_business', response.businessName || businessName || 'My Fleet Operations');
                            window.location.href = 'index.html';
                            return;
                        } else {
                            // STOP: Show clear error message and stay on login page
                            showLoginError(response.message || 'Invalid username or password. Please try again.');
                        }
                    } catch (error) {
                        console.error("Auth API Error:", error);
                        // Fallback client check for admin demo account
                        if (username === 'admin' && password === 'admin123') {
                            sessionStorage.setItem('vehigo_user', 'admin');
                            sessionStorage.setItem('vehigo_business', 'VEHIGO Fleet Master');
                            window.location.href = 'index.html';
                            return;
                        }

                        // STOP: Display exact error and DO NOT go forward
                        showLoginError(error.message || 'Invalid username or password. Please check your credentials.');
                    }
                });
            }

            function showLoginError(msg) {
                if (loginErrorMsg) {
                    loginErrorMsg.textContent = msg;
                    loginErrorMsg.style.display = 'block';
                } else {
                    showToast(msg, 'error');
                }
            }
        });
    } else if (!isPublicPage) {
        // Protected Fleet Management Pages Auth Guard
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
