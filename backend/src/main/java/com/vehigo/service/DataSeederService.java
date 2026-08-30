package com.vehigo.service;

import com.vehigo.model.Driver;
import com.vehigo.model.Maintenance;
import com.vehigo.model.Route;
import com.vehigo.model.Vehicle;
import com.vehigo.model.enums.*;
import com.vehigo.repository.DriverRepository;
import com.vehigo.repository.MaintenanceRepository;
import com.vehigo.repository.RouteRepository;
import com.vehigo.repository.VehicleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
public class DataSeederService implements CommandLineRunner {

    private final VehicleRepository vehicleRepository;
    private final DriverRepository driverRepository;
    private final RouteRepository routeRepository;
    private final MaintenanceRepository maintenanceRepository;

    @Autowired
    public DataSeederService(VehicleRepository vehicleRepository,
                             DriverRepository driverRepository,
                             RouteRepository routeRepository,
                             MaintenanceRepository maintenanceRepository) {
        this.vehicleRepository = vehicleRepository;
        this.driverRepository = driverRepository;
        this.routeRepository = routeRepository;
        this.maintenanceRepository = maintenanceRepository;
    }

    @Override
    public void run(String... args) {
        if (vehicleRepository.count() > 0) {
            System.out.println("[VEHIGO DataSeeder] Database already contains data. Skipping sample seeding.");
            return;
        }

        System.out.println("[VEHIGO DataSeeder] Empty database detected. Seeding sample logistics data...");

        // 1. Seed Vehicles
        Vehicle v1 = new Vehicle(null, "TN01AB1234", VehicleType.TRUCK, "Volvo", "FH16", 2022, 16.5, FuelType.DIESEL, VehicleStatus.ON_TRIP, null);
        v1.setCurrentLocation("Chennai Port");
        v1.setLatitude(13.0827);
        v1.setLongitude(80.2707);
        v1.setLastUpdated(LocalDateTime.now());
        v1 = vehicleRepository.save(v1);

        Vehicle v2 = new Vehicle(null, "TN02CD5678", VehicleType.VAN, "Tata", "Winger", 2021, 3.5, FuelType.DIESEL, VehicleStatus.AVAILABLE, null);
        v2.setCurrentLocation("Bangalore Hub");
        v2.setLatitude(12.9716);
        v2.setLongitude(77.5946);
        v2.setLastUpdated(LocalDateTime.now());
        v2 = vehicleRepository.save(v2);

        Vehicle v3 = new Vehicle(null, "AP05EF9012", VehicleType.TRUCK, "BharatBenz", "3523R", 2023, 20.0, FuelType.DIESEL, VehicleStatus.MAINTENANCE, null);
        v3.setCurrentLocation("Hyderabad Service Station");
        v3.setLatitude(17.3850);
        v3.setLongitude(78.4867);
        v3.setLastUpdated(LocalDateTime.now());
        v3 = vehicleRepository.save(v3);

        Vehicle v4 = new Vehicle(null, "KA01GH3456", VehicleType.CAR, "Hyundai", "Kona Electric", 2023, 1.2, FuelType.ELECTRIC, VehicleStatus.AVAILABLE, null);
        v4.setCurrentLocation("Electronic City, Bangalore");
        v4.setLatitude(12.8399);
        v4.setLongitude(77.6770);
        v4.setLastUpdated(LocalDateTime.now());
        v4 = vehicleRepository.save(v4);

        Vehicle v5 = new Vehicle(null, "MH12IJ7890", VehicleType.BUS, "Ashok Leyland", "Viking", 2020, 8.0, FuelType.CNG, VehicleStatus.AVAILABLE, null);
        v5.setCurrentLocation("Pune Station");
        v5.setLatitude(18.5204);
        v5.setLongitude(73.8567);
        v5.setLastUpdated(LocalDateTime.now());
        v5 = vehicleRepository.save(v5);

        // 2. Seed Drivers
        Driver d1 = new Driver(null, "Ravi Kumar", "+91 9876543210", "ravi.kumar@vehigo.com", "DL-TN01-2018-00123", LocalDate.of(2028, 5, 20), 8, DriverStatus.ON_TRIP, v1.getId());
        d1 = driverRepository.save(d1);

        Driver d2 = new Driver(null, "Arun Kumar", "+91 9876543211", "arun.kumar@vehigo.com", "DL-KA01-2019-00456", LocalDate.of(2027, 8, 15), 6, DriverStatus.AVAILABLE, v2.getId());
        d2 = driverRepository.save(d2);

        Driver d3 = new Driver(null, "Suresh", "+91 9876543212", "suresh.v@vehigo.com", "DL-AP05-2016-00789", LocalDate.of(2026, 12, 10), 11, DriverStatus.AVAILABLE, null);
        d3 = driverRepository.save(d3);

        Driver d4 = new Driver(null, "Priya Sharma", "+91 9876543213", "priya.s@vehigo.com", "DL-MH12-2020-00321", LocalDate.of(2029, 3, 30), 4, DriverStatus.AVAILABLE, v4.getId());
        d4 = driverRepository.save(d4);

        // Cross-link Driver IDs to Vehicles
        v1.setDriverId(d1.getId());
        v2.setDriverId(d2.getId());
        v4.setDriverId(d4.getId());
        vehicleRepository.save(v1);
        vehicleRepository.save(v2);
        vehicleRepository.save(v4);

        // 3. Seed Routes
        Route r1 = new Route(null, "Chennai Express Logistics", "Chennai Port", "Bangalore Hub", 346.5, "6 hrs 30 mins", RouteStatus.IN_PROGRESS, v1.getId(), d1.getId(), LocalDateTime.now().minusHours(2), LocalDateTime.now().plusHours(4));
        routeRepository.save(r1);

        Route r2 = new Route(null, "Southern Corridor Line", "Chennai", "Hyderabad", 625.0, "11 hrs", RouteStatus.PLANNED, v2.getId(), d2.getId(), LocalDateTime.now().plusDays(1), LocalDateTime.now().plusDays(1).plusHours(11));
        routeRepository.save(r2);

        Route r3 = new Route(null, "Deccan Transfer Route", "Bangalore", "Chennai", 346.5, "6 hrs 15 mins", RouteStatus.COMPLETED, v5.getId(), d4.getId(), LocalDateTime.now().minusDays(2), LocalDateTime.now().minusDays(2).plusHours(6));
        routeRepository.save(r3);

        // 4. Seed Maintenance Records
        Maintenance m1 = new Maintenance(null, v3.getId(), "Engine Overhaul & Hydraulic Inspection", "Complete engine diagnostics, oil filter replacement, and brake pad change.", LocalDate.now().minusDays(1), LocalDate.now().plusDays(2), 14500.0, MaintenanceStatus.IN_PROGRESS, "Scheduled preventive maintenance.");
        maintenanceRepository.save(m1);

        Maintenance m2 = new Maintenance(null, v1.getId(), "Periodic Wheel Balancing & Tire Rotation", "Tire pressure alignment and tread depth measurement.", LocalDate.now().minusDays(15), LocalDate.now().plusMonths(2), 3200.0, MaintenanceStatus.COMPLETED, "Completed without issues.");
        maintenanceRepository.save(m2);

        Maintenance m3 = new Maintenance(null, v2.getId(), "HVAC & Electrical Diagnostics", "Air conditioning gas refill and battery health evaluation.", LocalDate.now().plusDays(5), LocalDate.now().plusDays(35), 4500.0, MaintenanceStatus.SCHEDULED, "Upcoming scheduled service.");
        maintenanceRepository.save(m3);

        System.out.println("[VEHIGO DataSeeder] Sample logistics data successfully seeded!");
    }
}
