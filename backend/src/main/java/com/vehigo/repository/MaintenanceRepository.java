package com.vehigo.repository;

import com.vehigo.model.Maintenance;
import com.vehigo.model.enums.MaintenanceStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface MaintenanceRepository extends MongoRepository<Maintenance, String> {
    List<Maintenance> findByVehicleId(String vehicleId);
    List<Maintenance> findByStatus(MaintenanceStatus status);
    List<Maintenance> findByNextServiceDateBeforeAndStatus(LocalDate date, MaintenanceStatus status);
    long countByStatus(MaintenanceStatus status);
}
