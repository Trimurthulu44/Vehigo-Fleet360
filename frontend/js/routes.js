/* Routes Module Controller for routes.html */

let routesList = [];
let vehiclesList = [];
let driversList = [];

document.addEventListener('DOMContentLoaded', () => {
    loadDependencies();
    loadRoutes();

    document.getElementById('search-input')?.addEventListener('input', filterRoutes);
    document.getElementById('status-filter')?.addEventListener('change', filterRoutes);
    document.getElementById('route-form')?.addEventListener('submit', handleRouteSubmit);
});

async function loadDependencies() {
    try {
        vehiclesList = await API.get('/vehicles');
        driversList = await API.get('/drivers');
    } catch (e) {
        console.error('Error loading route dependencies:', e);
    }
}

async function loadRoutes() {
    const tableBody = document.getElementById('routes-table-body');
    if (!tableBody) return;

    try {
        routesList = await API.get('/routes');
        renderRoutesTable(routesList);
    } catch (error) {
        tableBody.innerHTML = `<tr><td colspan="9" style="text-align: center; color: var(--text-muted);">Failed to load routes.</td></tr>`;
    }
}

function renderRoutesTable(routes) {
    const tableBody = document.getElementById('routes-table-body');
    if (!tableBody) return;

    if (routes.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="9" style="text-align: center; color: var(--text-muted);">No routes match criteria.</td></tr>`;
        return;
    }

    tableBody.innerHTML = routes.map(r => {
        const vehicle = vehiclesList.find(v => v.id === r.vehicleId);
        const driver = driversList.find(d => d.id === r.driverId);

        return `
            <tr>
                <td><strong>${r.routeName}</strong></td>
                <td>${r.source} → ${r.destination}</td>
                <td>${r.distance ? r.distance + ' km' : 'N/A'}</td>
                <td>${r.estimatedDuration || 'N/A'}</td>
                <td>${vehicle ? vehicle.vehicleNumber : 'Unassigned'}</td>
                <td>${driver ? driver.name : 'Unassigned'}</td>
                <td><span class="badge ${getStatusBadgeClass(r.status)}">${r.status}</span></td>
                <td>
                    <select class="form-control" style="padding: 0.3rem 0.5rem; font-size: 0.8rem;" onchange="updateRouteStatus('${r.id}', this.value)">
                        <option value="PLANNED" ${r.status === 'PLANNED' ? 'selected' : ''}>PLANNED</option>
                        <option value="IN_PROGRESS" ${r.status === 'IN_PROGRESS' ? 'selected' : ''}>IN_PROGRESS</option>
                        <option value="COMPLETED" ${r.status === 'COMPLETED' ? 'selected' : ''}>COMPLETED</option>
                        <option value="CANCELLED" ${r.status === 'CANCELLED' ? 'selected' : ''}>CANCELLED</option>
                    </select>
                </td>
                <td>
                    <div style="display: flex; gap: 0.4rem;">
                        <button class="btn btn-secondary btn-sm" onclick="editRoute('${r.id}')">Edit</button>
                        <button class="btn btn-danger btn-sm" onclick="deleteRoute('${r.id}')">Delete</button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function filterRoutes() {
    const search = document.getElementById('search-input').value.toLowerCase().trim();
    const status = document.getElementById('status-filter').value;

    const filtered = routesList.filter(r => {
        const matchesSearch = r.routeName.toLowerCase().includes(search) ||
                              r.source.toLowerCase().includes(search) ||
                              r.destination.toLowerCase().includes(search);
        const matchesStatus = !status || r.status === status;
        return matchesSearch && matchesStatus;
    });

    renderRoutesTable(filtered);
}

function openAddRouteModal() {
    document.getElementById('route-modal-title').textContent = 'Create New Route';
    document.getElementById('route-id').value = '';
    document.getElementById('route-form').reset();

    populateDropdowns();
    openModal('route-modal');
}

function populateDropdowns(selectedVehicleId = '', selectedDriverId = '') {
    const vehicleSelect = document.getElementById('route-vehicle-select');
    const driverSelect = document.getElementById('route-driver-select');

    if (vehicleSelect) {
        vehicleSelect.innerHTML = `<option value="">-- Select Vehicle --</option>` +
            vehiclesList.map(v => `<option value="${v.id}" ${v.id === selectedVehicleId ? 'selected' : ''}>${v.vehicleNumber} (${v.vehicleType})</option>`).join('');
    }

    if (driverSelect) {
        driverSelect.innerHTML = `<option value="">-- Select Driver --</option>` +
            driversList.map(d => `<option value="${d.id}" ${d.id === selectedDriverId ? 'selected' : ''}>${d.name} (${d.licenseNumber})</option>`).join('');
    }
}

function editRoute(id) {
    const r = routesList.find(item => item.id === id);
    if (!r) return;

    document.getElementById('route-modal-title').textContent = 'Edit Route';
    document.getElementById('route-id').value = r.id;
    document.getElementById('route-name').value = r.routeName;
    document.getElementById('route-source').value = r.source;
    document.getElementById('route-destination').value = r.destination;
    document.getElementById('route-distance').value = r.distance || '';
    document.getElementById('route-duration').value = r.estimatedDuration || '';
    document.getElementById('route-status').value = r.status;

    populateDropdowns(r.vehicleId, r.driverId);
    openModal('route-modal');
}

async function handleRouteSubmit(e) {
    e.preventDefault();

    const id = document.getElementById('route-id').value;
    const payload = {
        routeName: document.getElementById('route-name').value.trim(),
        source: document.getElementById('route-source').value.trim(),
        destination: document.getElementById('route-destination').value.trim(),
        distance: parseFloat(document.getElementById('route-distance').value),
        estimatedDuration: document.getElementById('route-duration').value.trim(),
        vehicleId: document.getElementById('route-vehicle-select').value,
        driverId: document.getElementById('route-driver-select').value,
        status: document.getElementById('route-status').value
    };

    try {
        if (id) {
            await API.put(`/routes/${id}`, payload);
            showToast('Route updated successfully!');
        } else {
            await API.post('/routes', payload);
            showToast('Route created successfully!');
        }
        closeModal('route-modal');
        await loadDependencies();
        loadRoutes();
    } catch (error) {
        // Handled by API.js
    }
}

async function updateRouteStatus(routeId, newStatus) {
    try {
        await API.put(`/routes/${routeId}`, { status: newStatus });
        showToast(`Route status updated to ${newStatus}`);
        await loadDependencies();
        loadRoutes();
    } catch (error) {
        // Handled by API.js
    }
}

async function deleteRoute(id) {
    if (!confirm('Are you sure you want to delete this route?')) return;

    try {
        await API.delete(`/routes/${id}`);
        showToast('Route deleted successfully');
        loadRoutes();
    } catch (error) {
        // Handled by API.js
    }
}

function openModal(modalId) { document.getElementById(modalId)?.classList.add('active'); }
function closeModal(modalId) { document.getElementById(modalId)?.classList.remove('active'); }
