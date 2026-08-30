/* Dashboard Controller for index.html */

document.addEventListener('DOMContentLoaded', () => {
    loadDashboardStats();
    loadRecentRoutes();
    loadUpcomingMaintenance();
});

async function loadDashboardStats() {
    try {
        const stats = await API.get('/dashboard/stats');

        document.getElementById('stat-total-vehicles').textContent = stats.totalVehicles || 0;
        document.getElementById('stat-available-vehicles').textContent = stats.availableVehicles || 0;
        document.getElementById('stat-on-trip-vehicles').textContent = stats.vehiclesOnTrip || 0;
        document.getElementById('stat-maintenance-vehicles').textContent = stats.vehiclesInMaintenance || 0;

        document.getElementById('stat-total-drivers').textContent = stats.totalDrivers || 0;
        document.getElementById('stat-active-routes').textContent = stats.activeRoutes || 0;
        document.getElementById('stat-upcoming-maintenance').textContent = stats.upcomingMaintenance || 0;
    } catch (error) {
        console.error('Failed to load dashboard stats:', error);
    }
}

async function loadRecentRoutes() {
    const tableBody = document.getElementById('recent-routes-body');
    if (!tableBody) return;

    try {
        const routes = await API.get('/routes');
        const recent = routes.slice(0, 5); // display top 5

        if (recent.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted);">No recent routes found.</td></tr>`;
            return;
        }

        tableBody.innerHTML = recent.map(r => `
            <tr>
                <td><strong>${r.routeName || 'N/A'}</strong></td>
                <td>${r.source} → ${r.destination}</td>
                <td>${r.distance ? r.distance + ' km' : 'N/A'}</td>
                <td>${r.estimatedDuration || 'N/A'}</td>
                <td><span class="badge ${getStatusBadgeClass(r.status)}">${r.status}</span></td>
            </tr>
        `).join('');
    } catch (error) {
        tableBody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted);">Failed to load recent routes.</td></tr>`;
    }
}

async function loadUpcomingMaintenance() {
    const tableBody = document.getElementById('upcoming-maintenance-body');
    if (!tableBody) return;

    try {
        const records = await API.get('/maintenance');
        const upcoming = records.filter(m => m.status === 'SCHEDULED' || m.status === 'IN_PROGRESS').slice(0, 5);

        if (upcoming.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted);">No upcoming maintenance scheduled.</td></tr>`;
            return;
        }

        tableBody.innerHTML = upcoming.map(m => `
            <tr>
                <td><strong>${m.serviceType}</strong></td>
                <td>${formatDate(m.serviceDate)}</td>
                <td>${formatDate(m.nextServiceDate)}</td>
                <td>${formatCurrency(m.cost)}</td>
                <td><span class="badge ${getStatusBadgeClass(m.status)}">${m.status}</span></td>
            </tr>
        `).join('');
    } catch (error) {
        tableBody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted);">Failed to load maintenance records.</td></tr>`;
    }
}
