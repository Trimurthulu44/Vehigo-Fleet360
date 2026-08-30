# VEHIGO — Vehicle & Logistics Management Platform

VEHIGO is a full-stack, enterprise-grade Vehicle & Logistics Management Platform built with **Java 21**, **Spring Boot 3**, **Spring Data MongoDB**, and a **Vanilla JavaScript (HTML5/CSS3)** dashboard frontend.

Designed specifically as an interview-ready full-stack portfolio application, VEHIGO demonstrates clean layered software architecture, RESTful API design, Jakarta validation, global exception handling, real-time analytics aggregation, and interactive telematics simulation.

---

## 🚀 Features

### 1. 📊 Logistics Command Dashboard
- Real-time aggregated statistics for total fleet size, available vehicles, vehicles on trip, in-maintenance vehicles, total drivers, active routes, and scheduled maintenance.
- Live data streaming directly from Spring Boot REST APIs (`GET /api/dashboard/stats`).
- Tables rendering recent active routes and upcoming service schedules.

### 2. 🚛 Vehicle Management Module
- Register new vehicles with attributes: Vehicle Number, Type (TRUCK, VAN, BUS, CAR), Manufacturer, Model, Year, Capacity (Tons), Fuel Type (DIESEL, PETROL, ELECTRIC, CNG), and Status.
- Real-time instant search and filtering by status and vehicle type.
- Full CRUD operations (`POST`, `GET`, `PUT`, `DELETE /api/vehicles`).

### 3. 👨‍✈️ Driver Management & Assignment
- Manage driver profiles: Name, Phone, Email, License Number, Expiry Date, Experience, and Status.
- Enforce unique license number validation.
- Interactive vehicle assignment modal (`PUT /api/drivers/{id}/assign-vehicle`) linking vehicles to drivers.

### 4. 🛣️ Route Planning & Dispatch
- Schedule and plan routes: Route Name, Source, Destination, Distance (km), Estimated Duration, Vehicle Assignment, and Driver Assignment.
- Route status lifecycle management (`PLANNED` → `IN_PROGRESS` → `COMPLETED` / `CANCELLED`).
- Automated status syncing: Starting a route (`IN_PROGRESS`) automatically updates assigned vehicle and driver status to `ON_TRIP`.

### 5. 📡 Telematics & Vehicle Tracking
- Telematics simulation updating vehicle location, latitude, longitude, and status (`PUT /api/tracking/{vehicleId}`).
- Real-time live movement simulator for demonstration without requiring paid external map API keys.

### 6. 🔧 Vehicle Maintenance & Servicing
- Log preventive maintenance records: Vehicle ID, Service Type, Service Date, Next Due Date, Cost (INR), Status (`SCHEDULED`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`), and Garage Notes.
- Automatic status syncing: Placing a vehicle into `IN_PROGRESS` maintenance updates the vehicle status to `MAINTENANCE`.
- Cost tracking and service expenditure metrics.

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Backend Framework** | Java 21, Spring Boot 3.2.5, Spring Web, Spring Data MongoDB, Jakarta Validation |
| **Database** | MongoDB (`vehigo_db`) |
| **Frontend** | HTML5, CSS3 Custom Design System (Slate Theme), Vanilla JavaScript (ES6+), Fetch API |
| **Build & Tooling** | Maven (`mvn` / `mvnw`), VS Code, Postman compatible REST APIs |

---

## 🏗️ Backend Architecture

```
[ Frontend (HTML/CSS/JS Fetch API) ]
                 │
                 ▼
[ REST Controller (@RestController) ]  --> Validates input & handles HTTP requests
                 │
                 ▼
[ Service Layer (@Service) ]           --> Encapsulates business logic & status transitions
                 │
                 ▼
[ Repository (@Repository) ]          --> Spring Data MongoDB Repository interfaces
                 │
                 ▼
[ Database (MongoDB: vehigo_db) ]      --> Persistent JSON documents
```

---

## 📁 Project Structure

```
VEHIGO/
├── backend/
│   ├── pom.xml
│   ├── .mvn/wrapper/
│   └── src/
│       └── main/
│           ├── java/
│           │   └── com/
│           │       └── vehigo/
│           │           ├── VehigoApplication.java
│           │           ├── config/
│           │           │   ├── CorsConfig.java
│           │           │   └── MongoConfig.java
│           │           ├── controller/
│           │           │   ├── VehicleController.java
│           │           │   ├── DriverController.java
│           │           │   ├── RouteController.java
│           │           │   ├── TrackingController.java
│           │           │   ├── MaintenanceController.java
│           │           │   └── DashboardController.java
│           │           ├── service/
│           │           │   ├── VehicleService.java
│           │           │   ├── DriverService.java
│           │           │   ├── RouteService.java
│           │           │   ├── MaintenanceService.java
│           │           │   ├── DashboardService.java
│           │           │   └── DataSeederService.java
│           │           ├── repository/
│           │           │   ├── VehicleRepository.java
│           │           │   ├── DriverRepository.java
│           │           │   ├── RouteRepository.java
│           │           │   └── MaintenanceRepository.java
│           │           ├── model/
│           │           │   ├── Vehicle.java
│           │           │   ├── Driver.java
│           │           │   ├── Route.java
│           │           │   ├── Maintenance.java
│           │           │   └── enums/
│           │           ├── dto/
│           │           │   ├── TrackingUpdateDto.java
│           │           │   ├── DashboardStatsDto.java
│           │           │   └── ErrorResponseDto.java
│           │           └── exception/
│           │               ├── ResourceNotFoundException.java
│           │               ├── DuplicateResourceException.java
│           │               ├── BadRequestException.java
│           │               └── GlobalExceptionHandler.java
│           └── resources/
│               └── application.properties
│
├── frontend/
│   ├── index.html
│   ├── vehicles.html
│   ├── drivers.html
│   ├── routes.html
│   ├── tracking.html
│   ├── maintenance.html
│   ├── css/
│   │   └── style.css
│   └── js/
│       ├── api.js
│       ├── dashboard.js
│       ├── vehicles.js
│       ├── drivers.js
│       ├── routes.js
│       ├── tracking.js
│       └── maintenance.js
│
├── README.md
└── .gitignore
```

---

## ⚡ Quick Start & Run Instructions

### Prerequisites
1. **Java JDK 21+** installed (`java -version`).
2. **MongoDB** running locally on port `27017` (or configured via environment variable `MONGODB_URI`).

---

### Step 1: Start MongoDB
Ensure MongoDB daemon is running locally:
- **Windows Service**: `net start MongoDB` or start MongoDB Community Server / Compass.
- **Connection URI**: `mongodb://localhost:27017/vehigo_db`

---

### Step 2: Build & Start Spring Boot Backend
Navigate to the `backend/` directory:

```bash
cd backend
mvn spring-boot:run
```

The Spring Boot backend will start on port `8080`.

> [!NOTE]
> On initial launch, `DataSeederService` automatically seeds initial realistic sample vehicles, drivers, routes, and maintenance records if the MongoDB database is empty.

---

### Step 3: Open the Frontend Dashboard
Simply open `frontend/index.html` in any standard modern browser (Chrome, Edge, Firefox, Safari).

Alternatively, serve the `frontend/` folder using VS Code **Live Server** or any static HTTP file server.

---

## 📡 REST API Reference

### 🚛 Vehicle APIs (`/api/vehicles`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/vehicles` | List all vehicles (supports `?status=` & `?type=`) |
| `GET` | `/api/vehicles/{id}` | Get vehicle by ID |
| `POST` | `/api/vehicles` | Create new vehicle |
| `PUT` | `/api/vehicles/{id}` | Update existing vehicle |
| `DELETE` | `/api/vehicles/{id}` | Delete vehicle by ID |

### 👨‍✈️ Driver APIs (`/api/drivers`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/drivers` | List all drivers (supports `?status=`) |
| `GET` | `/api/drivers/{id}` | Get driver by ID |
| `POST` | `/api/drivers` | Create new driver profile |
| `PUT` | `/api/drivers/{id}` | Update driver profile |
| `PUT` | `/api/drivers/{id}/assign-vehicle` | Assign driver to vehicle |
| `DELETE` | `/api/drivers/{id}` | Delete driver |

### 🛣️ Route APIs (`/api/routes`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/routes` | List all routes |
| `GET` | `/api/routes/{id}` | Get route by ID |
| `POST` | `/api/routes` | Create new route |
| `PUT` | `/api/routes/{id}` | Update route details or status |
| `DELETE` | `/api/routes/{id}` | Delete route |

### 📡 Telematics APIs (`/api/tracking`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/tracking/{vehicleId}` | Get vehicle tracking coordinates |
| `PUT` | `/api/tracking/{vehicleId}` | Update vehicle GPS location & status |

### 🔧 Maintenance APIs (`/api/maintenance`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/maintenance` | List maintenance records |
| `GET` | `/api/maintenance/{id}` | Get record by ID |
| `POST` | `/api/maintenance` | Schedule new maintenance |
| `PUT` | `/api/maintenance/{id}` | Update maintenance record |
| `DELETE` | `/api/maintenance/{id}` | Delete record |

### 📊 Dashboard Analytics APIs (`/api/dashboard`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/dashboard/stats` | Retrieve dynamic fleet analytics overview |

---

## 📷 Screenshots

*(Placeholder for application interface screenshots)*
- **Logistics Command Dashboard**: Real-time stats cards & route monitor.
- **Vehicle Grid**: Filterable table with status badges and modal editor.
- **Live Telematics Tracker**: Coordinate simulation and location updater.

---

## 🔮 Future Enhancements
- Spring Security JWT authentication for Dispatchers, Fleet Managers, and Drivers.
- Leaflet.js / OpenStreetMap integration for visual map rendering.
- Fuel consumption analytics and driver efficiency scoring.
- Automated email alerts for upcoming maintenance schedules.
