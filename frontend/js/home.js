/* VEHIGO — SaaS Public Home Page Controller */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initial 1.5-Second Loading Screen Overlay Fade-Out
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        setTimeout(() => {
            loadingScreen.style.opacity = '0';
            loadingScreen.style.transition = 'opacity 0.4s ease-out';
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 400);
        }, 1500);
    }

    // 2. Smooth Scrolling for Internal Navigation Links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});
