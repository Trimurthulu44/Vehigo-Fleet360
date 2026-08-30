/* Drivers Module Controller for drivers.html */

let driversList = [];
let vehiclesMap = {};
let availableVehicles = [];

document.addEventListener('DOMContentLoaded', () => {
    loadVehiclesMap();
    loadDrivers();

    document.getElementById('search-input')?.addEventListener('input', filterDrivers);
    document.getElementById('status-filter')?.addEventListener('change', filterDrivers);

    document.getElementById('driver-form')?.addEventListener('submit', handleDriverSubmit);
    document.getElementById('assign-form')?.addEventListener('submit', handleAssignSubmit);
});

async function loadVehiclesMap() {
    try {
        const vehicles = await API.get('/vehicles');
        availableVehicles = vehicles;
        vehicles.forEach(v => { vehiclesMap[v.id] = v.vehicleNumber; });
    } catch (e) {
        console.error('Failed to load vehicles map:', e);
    }
}

async function loadDrivers() {
    const tableBody = document.getElementById('drivers-table-body');
    if (!tableBody) return;

    try {
        driversList = await API.get('/drivers');
        renderDriversTable(driversList);
    } catch (error) {
        tableBody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: var(--text-muted);">Failed to load drivers.</td></tr>`;
    }
}

function renderDriversTable(drivers) {
    const tableBody = document.getElementById('drivers-table-body');
    if (!tableBody) return;

    if (drivers.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: var(--text-muted);">No drivers found.</td></tr>`;
        return;
    }

    tableBody.innerHTML = drivers.map(d => `
        <tr>
            <td><strong>${d.name}</strong></td>
            <td>${d.phone || 'N/A'}<br><small style="color: var(--text-muted);">${d.email || ''}</small></td>
            <td><code>${d.licenseNumber}</code></td>
            <td>${formatDate(d.licenseExpiry)}</td>
            <td>${d.experience ? d.experience + ' Years' : 'N/A'}</td>
            <td><span class="badge ${getStatusBadgeClass(d.status)}">${d.status}</span></td>
            <td>${d.assignedVehicleId && vehiclesMap[d.assignedVehicleId] ? vehiclesMap[d.assignedVehicleId] : 'Unassigned'}</td>
            <td>
                <div style="display: flex; gap: 0.4rem;">
                    <button class="btn btn-secondary btn-sm" onclick="openAssignModal('${d.id}')">Assign</button>
                    <button class="btn btn-secondary btn-sm" onclick="editDriver('${d.id}')">Edit</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteDriver('${d.id}')">Delete</button>
                </div>
            </td>
        </tr>
    `).join('');
}

function filterDrivers() {
    const search = document.getElementById('search-input').value.toLowerCase().trim();
    const status = document.getElementById('status-filter').value;

    const filtered = driversList.filter(d => {
        const matchesSearch = d.name.toLowerCase().includes(search) ||
                              d.licenseNumber.toLowerCase().includes(search) ||
                              (d.phone && d.phone.includes(search));
        const matchesStatus = !status || d.status === status;
        return matchesSearch && matchesStatus;
    });

    renderDriversTable(filtered);
}

function openAddDriverModal() {
    document.getElementById('driver-modal-title').textContent = 'Add New Driver';
    document.getElementById('driver-id').value = '';
    document.getElementById('driver-form').reset();
    openModal('driver-modal');
}

function editDriver(id) {
    const d = driversList.find(item => item.id === id);
    if (!d) return;

    document.getElementById('driver-modal-title').textContent = 'Edit Driver';
    document.getElementById('driver-id').value = d.id;
    document.getElementById('driver-name').value = d.name;
    document.getElementById('driver-phone').value = d.phone || '';
    document.getElementById('driver-email').value = d.email || '';
    document.getElementById('driver-license').value = d.licenseNumber;
    document.getElementById('driver-expiry').value = d.licenseExpiry || '';
    document.getElementById('driver-experience').value = d.experience || '';
    document.getElementById('driver-status').value = d.status;

    openModal('driver-modal');
}

async function handleDriverSubmit(e) {
    e.preventDefault();

    const id = document.getElementById('driver-id').value;
    const payload = {
        name: document.getElementById('driver-name').value.trim(),
        phone: document.getElementById('driver-phone').value.trim(),
        email: document.getElementById('driver-email').value.trim(),
        licenseNumber: document.getElementById('driver-license').value.trim(),
        licenseExpiry: document.getElementById('driver-expiry').value,
        experience: parseInt(document.getElementById('driver-experience').value, 10) || 0,
        status: document.getElementById('driver-status').value
    };

    try {
        if (id) {
            await API.put(`/drivers/${id}`, payload);
            showToast('Driver updated successfully!');
        } else {
            await API.post('/drivers', payload);
            showToast('Driver created successfully!');
        }
        closeModal('driver-modal');
        loadDrivers();
    } catch (error) {
        // Handled by API.js
    }
}

function openAssignModal(driverId) {
    const driver = driversList.find(d => d.id === driverId);
    if (!driver) return;

    document.getElementById('assign-driver-id').value = driver.id;
    document.getElementById('assign-driver-name').textContent = driver.name;

    const select = document.getElementById('assign-vehicle-select');
    select.innerHTML = `<option value="">-- Unassigned --</option>` +
        availableVehicles.map(v => `<option value="${v.id}" ${driver.assignedVehicleId === v.id ? 'selected' : ''}>${v.vehicleNumber} (${v.vehicleType} - ${v.manufacturer})</option>`).join('');

    openModal('assign-modal');
}

async function handleAssignSubmit(e) {
    e.preventDefault();
    const driverId = document.getElementById('assign-driver-id').value;
    const vehicleId = document.getElementById('assign-vehicle-select').value;

    try {
        await API.put(`/drivers/${driverId}/assign-vehicle`, { vehicleId });
        showToast('Vehicle assigned successfully!');
        closeModal('assign-modal');
        await loadVehiclesMap();
        loadDrivers();
    } catch (error) {
        // Handled by API.js
    }
}

async function deleteDriver(id) {
    if (!confirm('Are you sure you want to delete this driver?')) return;

    try {
        await API.delete(`/drivers/${id}`);
        showToast('Driver deleted successfully');
        loadDrivers();
    } catch (error) {
        // Handled by API.js
    }
}

function openModal(modalId) { document.getElementById(modalId)?.classList.add('active'); }
function closeModal(modalId) { document.getElementById(modalId)?.classList.remove('active'); }
