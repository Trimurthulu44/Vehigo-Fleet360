package com.vehigo.service;

import com.vehigo.exception.BadRequestException;
import com.vehigo.exception.ResourceNotFoundException;
import com.vehigo.model.Driver;
import com.vehigo.model.Route;
import com.vehigo.model.Vehicle;
import com.vehigo.model.enums.DriverStatus;
import com.vehigo.model.enums.RouteStatus;
import com.vehigo.model.enums.VehicleStatus;
import com.vehigo.repository.DriverRepository;
import com.vehigo.repository.RouteRepository;
import com.vehigo.repository.VehicleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class RouteService {

    private final RouteRepository routeRepository;
    private final VehicleRepository vehicleRepository;
    private final DriverRepository driverRepository;

    @Autowired
    public RouteService(RouteRepository routeRepository,
                        VehicleRepository vehicleRepository,
                        DriverRepository driverRepository) {
        this.routeRepository = routeRepository;
        this.vehicleRepository = vehicleRepository;
        this.driverRepository = driverRepository;
    }

    public List<Route> getAllRoutes(String statusStr) {
        if (statusStr != null && !statusStr.isBlank()) {
            try {
                RouteStatus status = RouteStatus.valueOf(statusStr.toUpperCase());
                return routeRepository.findByStatus(status);
            } catch (IllegalArgumentException e) {
                throw new BadRequestException("Invalid route status: " + statusStr);
            }
        }
        return routeRepository.findAll();
    }

    public Route getRouteById(String id) {
        return routeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Route not found with ID: " + id));
    }

    public Route createRoute(Route route) {
        if (route.getRouteName() == null || route.getRouteName().isBlank()) {
            throw new BadRequestException("Route name is required");
        }
        if (route.getSource() == null || route.getSource().isBlank()) {
            throw new BadRequestException("Source location is required");
        }
        if (route.getDestination() == null || route.getDestination().isBlank()) {
            throw new BadRequestException("Destination location is required");
        }
        if (route.getDistance() != null && route.getDistance() <= 0) {
            throw new BadRequestException("Distance must be greater than zero");
        }

        route.setCreatedAt(LocalDateTime.now());
        route.setUpdatedAt(LocalDateTime.now());
        if (route.getStatus() == null) {
            route.getStatus(); // default PLANNED
            route.setStatus(RouteStatus.PLANNED);
        }

        Route savedRoute = routeRepository.save(route);
        updateAssignmentsAndStatuses(savedRoute);
        return savedRoute;
    }

    public Route updateRoute(String id, Route details) {
        Route existing = getRouteById(id);

        if (details.getRouteName() != null) existing.setRouteName(details.getRouteName());
        if (details.getSource() != null) existing.setSource(details.getSource());
        if (details.getDestination() != null) existing.setDestination(details.getDestination());
        if (details.getDistance() != null) {
            if (details.getDistance() <= 0) throw new BadRequestException("Distance must be positive");
            existing.setDistance(details.getDistance());
        }
        if (details.getEstimatedDuration() != null) existing.setEstimatedDuration(details.getEstimatedDuration());
        if (details.getVehicleId() != null) existing.setVehicleId(details.getVehicleId());
        if (details.getDriverId() != null) existing.setDriverId(details.getDriverId());
        if (details.getDepartureTime() != null) existing.setDepartureTime(details.getDepartureTime());
        if (details.getArrivalTime() != null) existing.setArrivalTime(details.getArrivalTime());

        if (details.getStatus() != null && details.getStatus() != existing.getStatus()) {
            existing.setStatus(details.getStatus());
        }

        existing.setUpdatedAt(LocalDateTime.now());
        Route saved = routeRepository.save(existing);
        updateAssignmentsAndStatuses(saved);
        return saved;
    }

    public void deleteRoute(String id) {
        Route route = getRouteById(id);
        routeRepository.delete(route);
    }

    private void updateAssignmentsAndStatuses(Route route) {
        if (route.getStatus() == RouteStatus.IN_PROGRESS) {
            if (route.getVehicleId() != null) {
                vehicleRepository.findById(route.getVehicleId()).ifPresent(v -> {
                    v.setStatus(VehicleStatus.ON_TRIP);
                    vehicleRepository.save(v);
                });
            }
            if (route.getDriverId() != null) {
                driverRepository.findById(route.getDriverId()).ifPresent(d -> {
                    d.setStatus(DriverStatus.ON_TRIP);
                    driverRepository.save(d);
                });
            }
        } else if (route.getStatus() == RouteStatus.COMPLETED || route.getStatus() == RouteStatus.CANCELLED) {
            if (route.getVehicleId() != null) {
                vehicleRepository.findById(route.getVehicleId()).ifPresent(v -> {
                    if (v.getStatus() == VehicleStatus.ON_TRIP) {
                        v.setStatus(VehicleStatus.AVAILABLE);
                        vehicleRepository.save(v);
                    }
                });
            }
            if (route.getDriverId() != null) {
                driverRepository.findById(route.getDriverId()).ifPresent(d -> {
                    if (d.getStatus() == DriverStatus.ON_TRIP) {
                        d.setStatus(DriverStatus.AVAILABLE);
                        driverRepository.save(d);
                    }
                });
            }
        }
    }
}
