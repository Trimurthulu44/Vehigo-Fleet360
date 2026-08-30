/* VEHIGO — Vehicle Tracking & Telematics Map Module */

let map = null;
let vehiclesList = [];
let driversMap = {};
let routesMap = {};
let vehicleMarkers = {};
let selectedVehicleId = null;

// Fallback Default Coordinates for Demonstration (Chennai, Bangalore, Hyderabad, Pune)
const DEFAULT_COORDS = [
    { lat: 13.0827, lng: 80.2707, location: "Chennai Port" },
    { lat: 12.9716, lng: 77.5946, location: "Bangalore Hub" },
    { lat: 17.3850, lng: 78.4867, location: "Hyderabad Service Station" },
    { lat: 12.8399, lng: 77.6770, location: "Electronic City, Bangalore" },
    { lat: 18.5204, lng: 73.8567, location: "Pune Station" }
];

document.addEventListener('DOMContentLoaded', async () => {
    try {
        initLeafletMap();
        await loadTrackingData();
        setupEventListeners();
    } catch (error) {
        console.error("Failed to initialize tracking dashboard:", error);
    }
});

// 1. Initialize Leaflet Map
function initLeafletMap() {
    const mapElement = document.getElementById('map');
    if (!mapElement) return;

    // Center map around South India region (Chennai / Bangalore)
    map = L.map('map', {
        center: [13.5, 78.5],
        zoom: 6,
        zoomControl: true
    });

    // Use OpenStreetMap Tile Layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
}

// 2. Load Vehicles, Drivers, and Routes Data
async function loadTrackingData() {
    try {
        const [vehicles, drivers, routes] = await Promise.all([
            API.get('/vehicles'),
            API.get('/drivers').catch(() => []),
            API.get('/routes').catch(() => [])
        ]);

        vehiclesList = vehicles || [];

        // Build lookup maps
        drivers.forEach(d => driversMap[d.id] = d);
        routes.forEach(r => {
            if (r.vehicleId) routesMap[r.vehicleId] = r;
        });

        renderVehicleSidebar(vehiclesList);
        renderMapMarkers(vehiclesList);

        if (vehiclesList.length > 0) {
            selectVehicle(vehiclesList[0].id);
        }
    } catch (error) {
        console.error("Error loading telematics data:", error);
    }
}

// 3. Render Vehicles List in Left Sidebar
function renderVehicleSidebar(vehicles) {
    const container = document.getElementById('vehicle-list-container');
    const badge = document.getElementById('vehicle-count-badge');
    if (!container) return;

    if (badge) {
        badge.textContent = `${vehicles.length} Vehicles`;
    }

    if (vehicles.length === 0) {
        container.innerHTML = `<li style="padding: 1.5rem; text-align: center; color: var(--text-muted);">No vehicles registered.</li>`;
        return;
    }

    container.innerHTML = vehicles.map((v) => {
        const driver = driversMap[v.driverId];
        const route = routesMap[v.id];
        const routeText = route ? `${route.sourceLocation} → ${route.destinationLocation}` : (v.currentLocation || 'In Transit');
        const badgeClass = getStatusBadgeClass(v.status);

        return `
            <li class="vehicle-item ${v.id === selectedVehicleId ? 'active' : ''}" data-id="${v.id}" onclick="selectVehicle('${v.id}')">
                <div class="vehicle-item-header">
                    <span class="vehicle-item-number">${v.vehicleNumber}</span>
                    <span class="badge ${badgeClass}">${v.status || 'AVAILABLE'}</span>
                </div>
                <div class="vehicle-item-route">
                    <svg viewBox="0 0 24 24" width="14" height="14" style="stroke: currentColor; fill: none; stroke-width: 2;"><path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                    <span>${routeText}</span>
                </div>
                <div style="font-size: 0.75rem; color: var(--text-muted);">
                    Driver: ${driver ? driver.name : 'Unassigned'} &bull; ${v.vehicleType}
                </div>
            </li>
        `;
    }).join('');
}

// 4. Render Markers on Leaflet Map
function renderMapMarkers(vehicles) {
    if (!map) return;

    // Clear existing markers
    Object.values(vehicleMarkers).forEach(m => map.removeLayer(m));
    vehicleMarkers = {};

    vehicles.forEach((v, index) => {
        const coords = getVehicleCoords(v, index);
        const marker = createCustomMarker(v, coords);
        marker.addTo(map);

        // Bind Popup Information
        const driver = driversMap[v.driverId];
        const route = routesMap[v.id];
        const routeText = route ? `${route.sourceLocation} → ${route.destinationLocation}` : 'No Active Route';
        const badgeClass = getStatusBadgeClass(v.status);
        const updatedTime = v.lastUpdated ? new Date(v.lastUpdated).toLocaleTimeString() : 'Just Now';

        const popupContent = `
            <div style="min-width: 190px;">
                <div class="popup-vehicle-title">${v.vehicleNumber}</div>
                <div style="margin-bottom: 0.4rem;">
                    <span class="badge ${badgeClass}">${v.status}</span>
                </div>
                <div class="popup-row"><strong>Type:</strong> ${v.vehicleType} (${v.manufacturer} ${v.model || ''})</div>
                <div class="popup-row"><strong>Driver:</strong> ${driver ? driver.name : 'Unassigned'}</div>
                <div class="popup-row"><strong>Route:</strong> ${routeText}</div>
                <div class="popup-row"><strong>Location:</strong> ${v.currentLocation || coords.location}</div>
                <div class="popup-row" style="font-size: 0.75rem; color: #94a3b8; margin-top: 0.5rem; border-top: 1px solid #334155; padding-top: 0.35rem;">
                    Last Updated: ${updatedTime}
                </div>
            </div>
        `;

        marker.bindPopup(popupContent);
        marker.on('click', () => {
            selectVehicle(v.id, false);
        });

        vehicleMarkers[v.id] = marker;
    });
}

// Create Custom Colored SVG Marker for Leaflet
function createCustomMarker(vehicle, coords) {
    let color = '#10b981'; // Available - Green
    if (vehicle.status === 'ON_TRIP') color = '#3b82f6'; // Blue
    if (vehicle.status === 'MAINTENANCE') color = '#f59e0b'; // Orange
    if (vehicle.status === 'INACTIVE') color = '#ef4444'; // Red

    const svgHtml = `
        <div style="position: relative; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">
            <div style="width: 28px; height: 28px; background-color: ${color}; border: 2.5px solid #ffffff; border-radius: 50%; box-shadow: 0 4px 10px rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; color: white;">
                <svg viewBox="0 0 24 24" width="16" height="16" style="stroke: #ffffff; fill: none; stroke-width: 2.2;"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
            </div>
        </div>
    `;

    const customIcon = L.divIcon({
        html: svgHtml,
        className: 'custom-vehicle-marker',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -16]
    });

    return L.marker([coords.lat, coords.lng], { icon: customIcon });
}

// Helper to determine coordinates from vehicle data or defaults
function getVehicleCoords(v, index) {
    if (v.latitude && v.longitude && v.latitude !== 0 && v.longitude !== 0) {
        return { lat: v.latitude, lng: v.longitude, location: v.currentLocation || "In Transit" };
    }
    const def = DEFAULT_COORDS[index % DEFAULT_COORDS.length];
    v.latitude = def.lat;
    v.longitude = def.lng;
    v.currentLocation = v.currentLocation || def.location;
    return def;
}

// 5. Select Vehicle in Sidebar and Center Map Marker
function selectVehicle(id, zoomMap = true) {
    selectedVehicleId = id;
    const vehicle = vehiclesList.find(v => v.id === id);
    if (!vehicle) return;

    // Highlight sidebar list item
    document.querySelectorAll('.vehicle-item').forEach(el => {
        el.classList.toggle('active', el.dataset.id === id);
    });

    // Focus map and trigger popup
    const marker = vehicleMarkers[id];
    if (marker && map) {
        const latLng = marker.getLatLng();
        if (zoomMap) {
            map.setView(latLng, 9, { animate: true });
        }
        marker.openPopup();
    }

    // Update Telematics Card UI
    const driver = driversMap[vehicle.driverId];
    const route = routesMap[vehicle.id];

    document.getElementById('track-vehicle-number').textContent = vehicle.vehicleNumber;
    document.getElementById('track-vehicle-type').textContent = `${vehicle.vehicleType} (${vehicle.manufacturer || ''} ${vehicle.model || ''})`;

    const statusBadge = document.getElementById('track-status');
    statusBadge.textContent = vehicle.status;
    statusBadge.className = `badge ${getStatusBadgeClass(vehicle.status)}`;

    document.getElementById('track-driver').textContent = driver ? driver.name : 'Unassigned';
    document.getElementById('track-route').textContent = route ? `${route.sourceLocation} → ${route.destinationLocation}` : 'No Active Route';
    document.getElementById('track-location-text').textContent = vehicle.currentLocation || 'In Transit';

    const coords = marker ? marker.getLatLng() : { lat: vehicle.latitude || 13.0827, lng: vehicle.longitude || 80.2707 };
    document.getElementById('track-lat').textContent = coords.lat.toFixed(4);
    document.getElementById('track-lng').textContent = coords.lng.toFixed(4);
    document.getElementById('track-updated').textContent = vehicle.lastUpdated ? new Date(vehicle.lastUpdated).toLocaleTimeString() : 'Just Now';

    // Populate API form fields
    document.getElementById('update-location').value = vehicle.currentLocation || '';
    document.getElementById('update-lat').value = coords.lat.toFixed(4);
    document.getElementById('update-lng').value = coords.lng.toFixed(4);
    document.getElementById('update-status').value = vehicle.status || 'AVAILABLE';
}

// 6. Setup Event Listeners (Search, Simulate Movement, API Submit)
function setupEventListeners() {
    // Vehicle Sidebar Search Filter
    const searchInput = document.getElementById('vehicle-search');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            const filtered = vehiclesList.filter(v =>
                v.vehicleNumber.toLowerCase().includes(query) ||
                (v.currentLocation && v.currentLocation.toLowerCase().includes(query)) ||
                v.vehicleType.toLowerCase().includes(query)
            );
            renderVehicleSidebar(filtered);
        });
    }

    // Simulate Movement Button Click
    const simBtn = document.getElementById('sim-move-btn');
    if (simBtn) {
        simBtn.addEventListener('click', simulateVehicleMovement);
    }

    // Manual Location Update Form Submit
    const trackingForm = document.getElementById('tracking-form');
    if (trackingForm) {
        trackingForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!selectedVehicleId) {
                showToast("Please select a vehicle first", "error");
                return;
            }

            const payload = {
                currentLocation: document.getElementById('update-location').value.trim(),
                latitude: parseFloat(document.getElementById('update-lat').value),
                longitude: parseFloat(document.getElementById('update-lng').value),
                status: document.getElementById('update-status').value
            };

            try {
                const updatedVehicle = await API.put(`/tracking/${selectedVehicleId}`, payload);
                showToast(`Telematics updated for ${updatedVehicle.vehicleNumber}`, "success");

                // Update local memory
                const index = vehiclesList.findIndex(v => v.id === selectedVehicleId);
                if (index !== -1) vehiclesList[index] = updatedVehicle;

                renderVehicleSidebar(vehiclesList);
                renderMapMarkers(vehiclesList);
                selectVehicle(selectedVehicleId, true);
            } catch (err) {
                console.error("Tracking update failed:", err);
            }
        });
    }
}

// 7. Simulated Telematics Movement Function
async function simulateVehicleMovement() {
    if (vehiclesList.length === 0) return;

    // Pick selected vehicle or first available
    let vehicle = vehiclesList.find(v => v.id === selectedVehicleId) || vehiclesList[0];
    selectedVehicleId = vehicle.id;

    const marker = vehicleMarkers[vehicle.id];
    if (!marker) return;

    const currentLatLng = marker.getLatLng();

    // Move slightly along simulated trajectory towards South India routes (0.01 to 0.03 deg shift)
    const latDelta = (Math.random() * 0.04 - 0.015);
    const lngDelta = (Math.random() * 0.04 - 0.015);

    const newLat = parseFloat((currentLatLng.lat + latDelta).toFixed(4));
    const newLng = parseFloat((currentLatLng.lng + lngDelta).toFixed(4));
    const nowTime = new Date().toISOString();

    const locationNames = ["En-route Highway NH44", "Toll Plaza Waypoint", "Regional Logistics Hub", "Transit Corridor", "City Outer Ring Road"];
    const newLoc = locationNames[Math.floor(Math.random() * locationNames.length)];

    // Animate marker on Leaflet Map smoothly
    marker.setLatLng([newLat, newLng]);
    map.panTo([newLat, newLng], { animate: true });

    const payload = {
        currentLocation: `${newLoc} (${vehicle.currentLocation || 'In Transit'})`,
        latitude: newLat,
        longitude: newLng,
        status: vehicle.status === 'AVAILABLE' ? 'ON_TRIP' : vehicle.status
    };

    try {
        const updatedVehicle = await API.put(`/tracking/${vehicle.id}`, payload);
        showToast(`⚡ Telematics Simulated: ${vehicle.vehicleNumber} moved to ${newLat}, ${newLng}`, "success");

        // Update local dataset
        const index = vehiclesList.findIndex(v => v.id === vehicle.id);
        if (index !== -1) vehiclesList[index] = updatedVehicle;

        renderVehicleSidebar(vehiclesList);
        renderMapMarkers(vehiclesList);
        selectVehicle(vehicle.id, false);
    } catch (err) {
        console.error("Simulation API sync failed:", err);
        // Fallback UI update if backend is offline
        vehicle.latitude = newLat;
        vehicle.longitude = newLng;
        vehicle.currentLocation = payload.currentLocation;
        vehicle.lastUpdated = nowTime;
        selectVehicle(vehicle.id, false);
        showToast(`Simulated marker position shift for ${vehicle.vehicleNumber}`, "success");
    }
}
