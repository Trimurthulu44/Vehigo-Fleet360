/* Vehicles Module Controller for vehicles.html */

let vehiclesList = [];
let driversMap = {};

document.addEventListener('DOMContentLoaded', () => {
    loadDriversMap();
    loadVehicles();

    // Event listeners
    document.getElementById('search-input')?.addEventListener('input', filterVehicles);
    document.getElementById('status-filter')?.addEventListener('change', filterVehicles);
    document.getElementById('type-filter')?.addEventListener('change', filterVehicles);

    document.getElementById('vehicle-form')?.addEventListener('submit', handleVehicleSubmit);
});

async function loadDriversMap() {
    try {
        const drivers = await API.get('/drivers');
        drivers.forEach(d => { driversMap[d.id] = d.name; });
    } catch (e) {
        console.error('Failed to load drivers map:', e);
    }
}

async function loadVehicles() {
    const tableBody = document.getElementById('vehicles-table-body');
    if (!tableBody) return;

    try {
        vehiclesList = await API.get('/vehicles');
        renderVehiclesTable(vehiclesList);
    } catch (error) {
        tableBody.innerHTML = `<tr><td colspan="9" style="text-align: center; color: var(--text-muted);">Failed to load vehicles from database.</td></tr>`;
    }
}

function renderVehiclesTable(vehicles) {
    const tableBody = document.getElementById('vehicles-table-body');
    if (!tableBody) return;

    if (vehicles.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="9" style="text-align: center; color: var(--text-muted);">No vehicles match the selected criteria.</td></tr>`;
        return;
    }

    tableBody.innerHTML = vehicles.map(v => `
        <tr>
            <td><strong>${v.vehicleNumber}</strong></td>
            <td><span class="badge badge-ontrip">${v.vehicleType}</span></td>
            <td>${v.manufacturer} ${v.model} (${v.year || 'N/A'})</td>
            <td>${v.capacity ? v.capacity + ' Tons' : 'N/A'}</td>
            <td>${v.fuelType}</td>
            <td><span class="badge ${getStatusBadgeClass(v.status)}">${v.status}</span></td>
            <td>${v.driverId && driversMap[v.driverId] ? driversMap[v.driverId] : (v.driverId || 'Unassigned')}</td>
            <td>${v.currentLocation || 'N/A'}</td>
            <td>
                <div style="display: flex; gap: 0.4rem;">
                    <button class="btn btn-secondary btn-sm" onclick="editVehicle('${v.id}')">Edit</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteVehicle('${v.id}')">Delete</button>
                </div>
            </td>
        </tr>
    `).join('');
}

function filterVehicles() {
    const search = document.getElementById('search-input').value.toLowerCase().trim();
    const status = document.getElementById('status-filter').value;
    const type = document.getElementById('type-filter').value;

    const filtered = vehiclesList.filter(v => {
        const matchesSearch = v.vehicleNumber.toLowerCase().includes(search) ||
                              (v.manufacturer && v.manufacturer.toLowerCase().includes(search)) ||
                              (v.model && v.model.toLowerCase().includes(search));
        const matchesStatus = !status || v.status === status;
        const matchesType = !type || v.vehicleType === type;

        return matchesSearch && matchesStatus && matchesType;
    });

    renderVehiclesTable(filtered);
}

function openAddVehicleModal() {
    document.getElementById('vehicle-modal-title').textContent = 'Add New Vehicle';
    document.getElementById('vehicle-id').value = '';
    document.getElementById('vehicle-form').reset();
    openModal('vehicle-modal');
}

function editVehicle(id) {
    const v = vehiclesList.find(item => item.id === id);
    if (!v) return;

    document.getElementById('vehicle-modal-title').textContent = 'Edit Vehicle';
    document.getElementById('vehicle-id').value = v.id;
    document.getElementById('vehicle-number').value = v.vehicleNumber;
    document.getElementById('vehicle-type').value = v.vehicleType;
    document.getElementById('vehicle-manufacturer').value = v.manufacturer || '';
    document.getElementById('vehicle-model').value = v.model || '';
    document.getElementById('vehicle-year').value = v.year || '';
    document.getElementById('vehicle-capacity').value = v.capacity || '';
    document.getElementById('vehicle-fuel').value = v.fuelType;
    document.getElementById('vehicle-status').value = v.status;

    openModal('vehicle-modal');
}

async function handleVehicleSubmit(e) {
    e.preventDefault();

    const id = document.getElementById('vehicle-id').value;
    const payload = {
        vehicleNumber: document.getElementById('vehicle-number').value.trim(),
        vehicleType: document.getElementById('vehicle-type').value,
        manufacturer: document.getElementById('vehicle-manufacturer').value.trim(),
        model: document.getElementById('vehicle-model').value.trim(),
        year: parseInt(document.getElementById('vehicle-year').value, 10),
        capacity: parseFloat(document.getElementById('vehicle-capacity').value),
        fuelType: document.getElementById('vehicle-fuel').value,
        status: document.getElementById('vehicle-status').value
    };

    try {
        if (id) {
            await API.put(`/vehicles/${id}`, payload);
            showToast('Vehicle updated successfully!');
        } else {
            await API.post('/vehicles', payload);
            showToast('Vehicle created successfully!');
        }
        closeModal('vehicle-modal');
        loadVehicles();
    } catch (error) {
        // error notification handled by API.js
    }
}

async function deleteVehicle(id) {
    if (!confirm('Are you sure you want to delete this vehicle?')) return;

    try {
        await API.delete(`/vehicles/${id}`);
        showToast('Vehicle deleted successfully');
        loadVehicles();
    } catch (error) {
        // error handled by API.js
    }
}

// Modal Toggle Helpers
function openModal(modalId) {
    document.getElementById(modalId)?.classList.add('active');
}

function closeModal(modalId) {
    document.getElementById(modalId)?.classList.remove('active');
}
