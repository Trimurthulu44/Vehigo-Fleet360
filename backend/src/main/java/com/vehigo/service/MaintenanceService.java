package com.vehigo.service;

import com.vehigo.exception.BadRequestException;
import com.vehigo.exception.ResourceNotFoundException;
import com.vehigo.model.Maintenance;
import com.vehigo.model.enums.MaintenanceStatus;
import com.vehigo.model.enums.VehicleStatus;
import com.vehigo.repository.MaintenanceRepository;
import com.vehigo.repository.VehicleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class MaintenanceService {

    private final MaintenanceRepository maintenanceRepository;
    private final VehicleRepository vehicleRepository;

    @Autowired
    public MaintenanceService(MaintenanceRepository maintenanceRepository, VehicleRepository vehicleRepository) {
        this.maintenanceRepository = maintenanceRepository;
        this.vehicleRepository = vehicleRepository;
    }

    public List<Maintenance> getAllMaintenance(String statusStr, String vehicleId) {
        if (vehicleId != null && !vehicleId.isBlank()) {
            return maintenanceRepository.findByVehicleId(vehicleId);
        }
        if (statusStr != null && !statusStr.isBlank()) {
            try {
                MaintenanceStatus status = MaintenanceStatus.valueOf(statusStr.toUpperCase());
                return maintenanceRepository.findByStatus(status);
            } catch (IllegalArgumentException e) {
                throw new BadRequestException("Invalid maintenance status: " + statusStr);
            }
        }
        return maintenanceRepository.findAll();
    }

    public Maintenance getMaintenanceById(String id) {
        return maintenanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Maintenance record not found with ID: " + id));
    }

    public Maintenance createMaintenance(Maintenance maintenance) {
        if (maintenance.getVehicleId() == null || maintenance.getVehicleId().isBlank()) {
            throw new BadRequestException("Vehicle ID is required for maintenance record");
        }
        if (maintenance.getServiceType() == null || maintenance.getServiceType().isBlank()) {
            throw new BadRequestException("Service type is required");
        }

        // Verify vehicle exists
        vehicleRepository.findById(maintenance.getVehicleId())
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with ID: " + maintenance.getVehicleId()));

        maintenance.setCreatedAt(LocalDateTime.now());
        maintenance.setUpdatedAt(LocalDateTime.now());
        if (maintenance.getStatus() == null) {
            maintenance.setStatus(MaintenanceStatus.SCHEDULED);
        }

        Maintenance saved = maintenanceRepository.save(maintenance);
        updateVehicleMaintenanceStatus(saved);
        return saved;
    }

    public Maintenance updateMaintenance(String id, Maintenance details) {
        Maintenance existing = getMaintenanceById(id);

        if (details.getVehicleId() != null) existing.setVehicleId(details.getVehicleId());
        if (details.getServiceType() != null) existing.setServiceType(details.getServiceType());
        if (details.getDescription() != null) existing.setDescription(details.getDescription());
        if (details.getServiceDate() != null) existing.setServiceDate(details.getServiceDate());
        if (details.getNextServiceDate() != null) existing.setNextServiceDate(details.getNextServiceDate());
        if (details.getCost() != null) existing.setCost(details.getCost());
        if (details.getStatus() != null) existing.setStatus(details.getStatus());
        if (details.getNotes() != null) existing.setNotes(details.getNotes());

        existing.setUpdatedAt(LocalDateTime.now());
        Maintenance saved = maintenanceRepository.save(existing);
        updateVehicleMaintenanceStatus(saved);
        return saved;
    }

    public void deleteMaintenance(String id) {
        Maintenance record = getMaintenanceById(id);
        maintenanceRepository.delete(record);
    }

    private void updateVehicleMaintenanceStatus(Maintenance record) {
        if (record.getVehicleId() == null) return;

        vehicleRepository.findById(record.getVehicleId()).ifPresent(vehicle -> {
            if (record.getStatus() == MaintenanceStatus.IN_PROGRESS) {
                vehicle.setStatus(VehicleStatus.MAINTENANCE);
                vehicleRepository.save(vehicle);
            } else if (record.getStatus() == MaintenanceStatus.COMPLETED || record.getStatus() == MaintenanceStatus.CANCELLED) {
                if (vehicle.getStatus() == VehicleStatus.MAINTENANCE) {
                    vehicle.setStatus(VehicleStatus.AVAILABLE);
                    vehicleRepository.save(vehicle);
                }
            }
        });
    }
}
