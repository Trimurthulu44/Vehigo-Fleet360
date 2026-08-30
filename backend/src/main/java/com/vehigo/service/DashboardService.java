package com.vehigo.service;

import com.vehigo.dto.DashboardStatsDto;
import com.vehigo.model.enums.*;
import com.vehigo.repository.DriverRepository;
import com.vehigo.repository.MaintenanceRepository;
import com.vehigo.repository.RouteRepository;
import com.vehigo.repository.VehicleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
public class DashboardService {

    private final VehicleRepository vehicleRepository;
    private final DriverRepository driverRepository;
    private final RouteRepository routeRepository;
    private final MaintenanceRepository maintenanceRepository;

    @Autowired
    public DashboardService(VehicleRepository vehicleRepository,
                            DriverRepository driverRepository,
                            RouteRepository routeRepository,
                            MaintenanceRepository maintenanceRepository) {
        this.vehicleRepository = vehicleRepository;
        this.driverRepository = driverRepository;
        this.routeRepository = routeRepository;
        this.maintenanceRepository = maintenanceRepository;
    }

    public DashboardStatsDto getDashboardStats() {
        DashboardStatsDto stats = new DashboardStatsDto();

        // Vehicle statistics
        stats.setTotalVehicles(vehicleRepository.count());
        stats.setAvailableVehicles(vehicleRepository.countByStatus(VehicleStatus.AVAILABLE));
        stats.setVehiclesOnTrip(vehicleRepository.countByStatus(VehicleStatus.ON_TRIP));
        stats.setVehiclesInMaintenance(vehicleRepository.countByStatus(VehicleStatus.MAINTENANCE));
        stats.setInactiveVehicles(vehicleRepository.countByStatus(VehicleStatus.INACTIVE));

        // Driver statistics
        stats.setTotalDrivers(driverRepository.count());
        stats.setAvailableDrivers(driverRepository.countByStatus(DriverStatus.AVAILABLE));
        stats.setDriversOnTrip(driverRepository.countByStatus(DriverStatus.ON_TRIP));

        // Route statistics
        stats.setTotalRoutes(routeRepository.count());
        stats.setActiveRoutes(routeRepository.countByStatus(RouteStatus.IN_PROGRESS));
        stats.setCompletedRoutes(routeRepository.countByStatus(RouteStatus.COMPLETED));
        stats.setPlannedRoutes(routeRepository.countByStatus(RouteStatus.PLANNED));

        // Maintenance statistics
        stats.setUpcomingMaintenance(maintenanceRepository.countByStatus(MaintenanceStatus.SCHEDULED));

        double totalCost = maintenanceRepository.findAll().stream()
                .filter(m -> m.getCost() != null)
                .mapToDouble(m -> m.getCost())
                .sum();
        stats.setTotalMaintenanceCost(totalCost);

        return stats;
    }
}
