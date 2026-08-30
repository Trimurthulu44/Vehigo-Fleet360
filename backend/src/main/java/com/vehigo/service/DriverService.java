package com.vehigo.service;

import com.vehigo.exception.BadRequestException;
import com.vehigo.exception.DuplicateResourceException;
import com.vehigo.exception.ResourceNotFoundException;
import com.vehigo.model.Driver;
import com.vehigo.model.Vehicle;
import com.vehigo.model.enums.DriverStatus;
import com.vehigo.repository.DriverRepository;
import com.vehigo.repository.VehicleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class DriverService {

    private final DriverRepository driverRepository;
    private final VehicleRepository vehicleRepository;

    @Autowired
    public DriverService(DriverRepository driverRepository, VehicleRepository vehicleRepository) {
        this.driverRepository = driverRepository;
        this.vehicleRepository = vehicleRepository;
    }

    public List<Driver> getAllDrivers(String statusStr) {
        if (statusStr != null && !statusStr.isBlank()) {
            try {
                DriverStatus status = DriverStatus.valueOf(statusStr.toUpperCase());
                return driverRepository.findByStatus(status);
            } catch (IllegalArgumentException e) {
                throw new BadRequestException("Invalid driver status: " + statusStr);
            }
        }
        return driverRepository.findAll();
    }

    public Driver getDriverById(String id) {
        return driverRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Driver not found with ID: " + id));
    }

    public Driver createDriver(Driver driver) {
        if (driver.getName() == null || driver.getName().isBlank()) {
            throw new BadRequestException("Driver name is required");
        }
        if (driver.getLicenseNumber() == null || driver.getLicenseNumber().isBlank()) {
            throw new BadRequestException("License number is required");
        }
        if (driverRepository.existsByLicenseNumber(driver.getLicenseNumber())) {
            throw new DuplicateResourceException("Driver already exists with license number: " + driver.getLicenseNumber());
        }

        driver.setCreatedAt(LocalDateTime.now());
        driver.setUpdatedAt(LocalDateTime.now());
        if (driver.getStatus() == null) {
            driver.setStatus(DriverStatus.AVAILABLE);
        }
        return driverRepository.save(driver);
    }

    public Driver updateDriver(String id, Driver details) {
        Driver existing = getDriverById(id);

        if (details.getLicenseNumber() != null && !details.getLicenseNumber().equals(existing.getLicenseNumber())) {
            if (driverRepository.existsByLicenseNumber(details.getLicenseNumber())) {
                throw new DuplicateResourceException("License number already registered: " + details.getLicenseNumber());
            }
            existing.setLicenseNumber(details.getLicenseNumber());
        }

        if (details.getName() != null) existing.setName(details.getName());
        if (details.getPhone() != null) existing.setPhone(details.getPhone());
        if (details.getEmail() != null) existing.setEmail(details.getEmail());
        if (details.getLicenseExpiry() != null) existing.setLicenseExpiry(details.getLicenseExpiry());
        if (details.getExperience() != null) existing.setExperience(details.getExperience());
        if (details.getStatus() != null) existing.setStatus(details.getStatus());
        if (details.getAssignedVehicleId() != null) existing.setAssignedVehicleId(details.getAssignedVehicleId());

        existing.setUpdatedAt(LocalDateTime.now());
        return driverRepository.save(existing);
    }

    public void deleteDriver(String id) {
        Driver driver = getDriverById(id);

        // Unlink driver from vehicle if assigned
        if (driver.getAssignedVehicleId() != null) {
            vehicleRepository.findById(driver.getAssignedVehicleId()).ifPresent(v -> {
                v.setDriverId(null);
                vehicleRepository.save(v);
            });
        }
        driverRepository.delete(driver);
    }

    public Driver assignVehicle(String driverId, String vehicleId) {
        Driver driver = getDriverById(driverId);
        if (vehicleId != null && !vehicleId.isBlank()) {
            Vehicle vehicle = vehicleRepository.findById(vehicleId)
                    .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with ID: " + vehicleId));

            // Set reverse relation on vehicle
            vehicle.setDriverId(driverId);
            vehicleRepository.save(vehicle);

            driver.setAssignedVehicleId(vehicleId);
        } else {
            // Unassign
            if (driver.getAssignedVehicleId() != null) {
                vehicleRepository.findById(driver.getAssignedVehicleId()).ifPresent(v -> {
                    v.setDriverId(null);
                    vehicleRepository.save(v);
                });
            }
            driver.setAssignedVehicleId(null);
        }

        driver.setUpdatedAt(LocalDateTime.now());
        return driverRepository.save(driver);
    }
}
