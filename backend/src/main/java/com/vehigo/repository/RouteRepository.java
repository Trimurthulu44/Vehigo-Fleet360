package com.vehigo.repository;

import com.vehigo.model.Route;
import com.vehigo.model.enums.RouteStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RouteRepository extends MongoRepository<Route, String> {
    List<Route> findByStatus(RouteStatus status);
    List<Route> findByVehicleId(String vehicleId);
    List<Route> findByDriverId(String driverId);
    long countByStatus(RouteStatus status);
}
