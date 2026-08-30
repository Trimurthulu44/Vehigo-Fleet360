package com.vehigo.repository;

import com.vehigo.model.Driver;
import com.vehigo.model.enums.DriverStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DriverRepository extends MongoRepository<Driver, String> {
    Optional<Driver> findByLicenseNumber(String licenseNumber);
    boolean existsByLicenseNumber(String licenseNumber);
    List<Driver> findByStatus(DriverStatus status);
    Optional<Driver> findByAssignedVehicleId(String vehicleId);
    long countByStatus(DriverStatus status);
}
