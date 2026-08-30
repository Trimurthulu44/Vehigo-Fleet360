package com.vehigo.repository;

import com.vehigo.model.Vehicle;
import com.vehigo.model.enums.VehicleStatus;
import com.vehigo.model.enums.VehicleType;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VehicleRepository extends MongoRepository<Vehicle, String> {
    Optional<Vehicle> findByVehicleNumber(String vehicleNumber);
    boolean existsByVehicleNumber(String vehicleNumber);
    List<Vehicle> findByStatus(VehicleStatus status);
    List<Vehicle> findByVehicleType(VehicleType vehicleType);
    long countByStatus(VehicleStatus status);
}
