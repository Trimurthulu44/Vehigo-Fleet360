package com.vehigo.service;

import com.vehigo.dto.TrackingUpdateDto;
import com.vehigo.exception.BadRequestException;
import com.vehigo.exception.DuplicateResourceException;
import com.vehigo.exception.ResourceNotFoundException;
import com.vehigo.model.Vehicle;
import com.vehigo.model.enums.VehicleStatus;
import com.vehigo.model.enums.VehicleType;
import com.vehigo.repository.VehicleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class VehicleService {

    private final VehicleRepository vehicleRepository;

    @Autowired
    public VehicleService(VehicleRepository vehicleRepository) {
        this.vehicleRepository = vehicleRepository;
    }

    public List<Vehicle> getAllVehicles(String statusStr, String typeStr) {
        if (statusStr != null && !statusStr.isBlank()) {
            try {
                VehicleStatus status = VehicleStatus.valueOf(statusStr.toUpperCase());
                return vehicleRepository.findByStatus(status);
            } catch (IllegalArgumentException e) {
                throw new BadRequestException("Invalid vehicle status: " + statusStr);
            }
        }
        if (typeStr != null && !typeStr.isBlank()) {
            try {
                VehicleType type = VehicleType.valueOf(typeStr.toUpperCase());
                return vehicleRepository.findByVehicleType(type);
            } catch (IllegalArgumentException e) {
                throw new BadRequestException("Invalid vehicle type: " + typeStr);
            }
        }
        return vehicleRepository.findAll();
    }

    public Vehicle getVehicleById(String id) {
        return vehicleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with ID: " + id));
    }

    public Vehicle createVehicle(Vehicle vehicle) {
        if (vehicle.getVehicleNumber() == null || vehicle.getVehicleNumber().isBlank()) {
            throw new BadRequestException("Vehicle number is required");
        }
        if (vehicleRepository.existsByVehicleNumber(vehicle.getVehicleNumber())) {
            throw new DuplicateResourceException("Vehicle already exists with number: " + vehicle.getVehicleNumber());
        }
        if (vehicle.getCapacity() != null && vehicle.getCapacity() <= 0) {
            throw new BadRequestException("Capacity must be positive");
        }
        if (vehicle.getYear() != null && (vehicle.getYear() < 1990 || vehicle.getYear() > LocalDateTime.now().getYear() + 1)) {
            throw new BadRequestException("Please enter a valid vehicle year");
        }

        vehicle.setCreatedAt(LocalDateTime.now());
        vehicle.setUpdatedAt(LocalDateTime.now());
        if (vehicle.getStatus() == null) {
            vehicle.setStatus(VehicleStatus.AVAILABLE);
        }
        return vehicleRepository.save(vehicle);
    }

    public Vehicle updateVehicle(String id, Vehicle details) {
        Vehicle existing = getVehicleById(id);

        if (details.getVehicleNumber() != null && !details.getVehicleNumber().equals(existing.getVehicleNumber())) {
            if (vehicleRepository.existsByVehicleNumber(details.getVehicleNumber())) {
                throw new DuplicateResourceException("Vehicle number already in use: " + details.getVehicleNumber());
            }
            existing.setVehicleNumber(details.getVehicleNumber());
        }

        if (details.getVehicleType() != null) existing.setVehicleType(details.getVehicleType());
        if (details.getManufacturer() != null) existing.setManufacturer(details.getManufacturer());
        if (details.getModel() != null) existing.setModel(details.getModel());
        if (details.getYear() != null) existing.setYear(details.getYear());
        if (details.getCapacity() != null) {
            if (details.getCapacity() <= 0) throw new BadRequestException("Capacity must be positive");
            existing.setCapacity(details.getCapacity());
        }
        if (details.getFuelType() != null) existing.setFuelType(details.getFuelType());
        if (details.getStatus() != null) existing.setStatus(details.getStatus());
        if (details.getDriverId() != null) existing.setDriverId(details.getDriverId());

        existing.setUpdatedAt(LocalDateTime.now());
        return vehicleRepository.save(existing);
    }

    public void deleteVehicle(String id) {
        Vehicle vehicle = getVehicleById(id);
        vehicleRepository.delete(vehicle);
    }

    public Vehicle updateTracking(String id, TrackingUpdateDto trackingDto) {
        Vehicle vehicle = getVehicleById(id);
        vehicle.setCurrentLocation(trackingDto.getCurrentLocation());
        vehicle.setLatitude(trackingDto.getLatitude());
        vehicle.setLongitude(trackingDto.getLongitude());
        vehicle.setLastUpdated(LocalDateTime.now());
        vehicle.setUpdatedAt(LocalDateTime.now());

        if (trackingDto.getVehicleStatus() != null && !trackingDto.getVehicleStatus().isBlank()) {
            try {
                vehicle.setStatus(VehicleStatus.valueOf(trackingDto.getVehicleStatus().toUpperCase()));
            } catch (IllegalArgumentException e) {
                // Keep existing status if invalid string passed
            }
        }

        return vehicleRepository.save(vehicle);
    }
}
