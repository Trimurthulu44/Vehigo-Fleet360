/* Maintenance Module Controller for maintenance.html */

let maintenanceList = [];
let vehiclesList = [];

document.addEventListener('DOMContentLoaded', () => {
    loadVehiclesList();
    loadMaintenance();

    document.getElementById('search-input')?.addEventListener('input', filterMaintenance);
    document.getElementById('status-filter')?.addEventListener('change', filterMaintenance);
    document.getElementById('maintenance-form')?.addEventListener('submit', handleMaintenanceSubmit);
});

async function loadVehiclesList() {
    try {
        vehiclesList = await API.get('/vehicles');
    } catch (e) {
        console.error('Error loading vehicles:', e);
    }
}

async function loadMaintenance() {
    const tableBody = document.getElementById('maintenance-table-body');
    if (!tableBody) return;

    try {
        maintenanceList = await API.get('/maintenance');
        updateMaintenanceMetrics(maintenanceList);
        renderMaintenanceTable(maintenanceList);
    } catch (error) {
        tableBody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: var(--text-muted);">Failed to load maintenance records.</td></tr>`;
    }
}

function updateMaintenanceMetrics(records) {
    const totalCost = records.reduce((sum, r) => sum + (r.cost || 0), 0);
    const upcomingCount = records.filter(r => r.status === 'SCHEDULED').length;
    const inProgressCount = records.filter(r => r.status === 'IN_PROGRESS').length;

    if (document.getElementById('metric-total-cost')) {
        document.getElementById('metric-total-cost').textContent = formatCurrency(totalCost);
    }
    if (document.getElementById('metric-upcoming')) {
        document.getElementById('metric-upcoming').textContent = upcomingCount;
    }
    if (document.getElementById('metric-in-progress')) {
        document.getElementById('metric-in-progress').textContent = inProgressCount;
    }
}

function renderMaintenanceTable(records) {
    const tableBody = document.getElementById('maintenance-table-body');
    if (!tableBody) return;

    if (records.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: var(--text-muted);">No maintenance records found.</td></tr>`;
        return;
    }

    tableBody.innerHTML = records.map(m => {
        const vehicle = vehiclesList.find(v => v.id === m.vehicleId);

        return `
            <tr>
                <td><strong>${m.serviceType}</strong></td>
                <td>${vehicle ? vehicle.vehicleNumber : 'N/A'}</td>
                <td>${formatDate(m.serviceDate)}</td>
                <td>${formatDate(m.nextServiceDate)}</td>
                <td><strong>${formatCurrency(m.cost)}</strong></td>
                <td><span class="badge ${getStatusBadgeClass(m.status)}">${m.status}</span></td>
                <td>${m.description || 'N/A'}</td>
                <td>
                    <div style="display: flex; gap: 0.4rem;">
                        <button class="btn btn-secondary btn-sm" onclick="editMaintenance('${m.id}')">Edit</button>
                        <button class="btn btn-danger btn-sm" onclick="deleteMaintenance('${m.id}')">Delete</button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function filterMaintenance() {
    const search = document.getElementById('search-input').value.toLowerCase().trim();
    const status = document.getElementById('status-filter').value;

    const filtered = maintenanceList.filter(m => {
        const vehicle = vehiclesList.find(v => v.id === m.vehicleId);
        const vNum = vehicle ? vehicle.vehicleNumber.toLowerCase() : '';

        const matchesSearch = m.serviceType.toLowerCase().includes(search) ||
                              vNum.includes(search) ||
                              (m.description && m.description.toLowerCase().includes(search));
        const matchesStatus = !status || m.status === status;
        return matchesSearch && matchesStatus;
    });

    renderMaintenanceTable(filtered);
}

function openAddMaintenanceModal() {
    document.getElementById('maintenance-modal-title').textContent = 'Schedule Maintenance';
    document.getElementById('maintenance-id').value = '';
    document.getElementById('maintenance-form').reset();

    populateVehicleSelect();
    openModal('maintenance-modal');
}

function populateVehicleSelect(selectedId = '') {
    const select = document.getElementById('m-vehicle-select');
    if (!select) return;

    select.innerHTML = `<option value="">-- Select Vehicle --</option>` +
        vehiclesList.map(v => `<option value="${v.id}" ${v.id === selectedId ? 'selected' : ''}>${v.vehicleNumber} (${v.manufacturer} ${v.model})</option>`).join('');
}

function editMaintenance(id) {
    const m = maintenanceList.find(item => item.id === id);
    if (!m) return;

    document.getElementById('maintenance-modal-title').textContent = 'Edit Maintenance Record';
    document.getElementById('maintenance-id').value = m.id;
    document.getElementById('m-service-type').value = m.serviceType;
    document.getElementById('m-service-date').value = m.serviceDate || '';
    document.getElementById('m-next-date').value = m.nextServiceDate || '';
    document.getElementById('m-cost').value = m.cost || '';
    document.getElementById('m-status').value = m.status;
    document.getElementById('m-description').value = m.description || '';
    document.getElementById('m-notes').value = m.notes || '';

    populateVehicleSelect(m.vehicleId);
    openModal('maintenance-modal');
}

async function handleMaintenanceSubmit(e) {
    e.preventDefault();

    const id = document.getElementById('maintenance-id').value;
    const payload = {
        vehicleId: document.getElementById('m-vehicle-select').value,
        serviceType: document.getElementById('m-service-type').value.trim(),
        serviceDate: document.getElementById('m-service-date').value,
        nextServiceDate: document.getElementById('m-next-date').value,
        cost: parseFloat(document.getElementById('m-cost').value) || 0,
        status: document.getElementById('m-status').value,
        description: document.getElementById('m-description').value.trim(),
        notes: document.getElementById('m-notes').value.trim()
    };

    try {
        if (id) {
            await API.put(`/maintenance/${id}`, payload);
            showToast('Maintenance record updated!');
        } else {
            await API.post('/maintenance', payload);
            showToast('Maintenance scheduled successfully!');
        }
        closeModal('maintenance-modal');
        await loadVehiclesList();
        loadMaintenance();
    } catch (error) {
        // Handled by API.js
    }
}

async function deleteMaintenance(id) {
    if (!confirm('Are you sure you want to delete this maintenance record?')) return;

    try {
        await API.delete(`/maintenance/${id}`);
        showToast('Maintenance record deleted');
        loadMaintenance();
    } catch (error) {
        // Handled by API.js
    }
}

function openModal(modalId) { document.getElementById(modalId)?.classList.add('active'); }
function closeModal(modalId) { document.getElementById(modalId)?.classList.remove('active'); }
