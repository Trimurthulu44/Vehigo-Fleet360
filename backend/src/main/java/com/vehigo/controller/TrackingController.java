package com.vehigo.controller;

import com.vehigo.dto.TrackingUpdateDto;
import com.vehigo.model.Vehicle;
import com.vehigo.service.VehicleService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/tracking")
public class TrackingController {

    private final VehicleService vehicleService;

    @Autowired
    public TrackingController(VehicleService vehicleService) {
        this.vehicleService = vehicleService;
    }

    @GetMapping("/{vehicleId}")
    public ResponseEntity<Vehicle> getVehicleTracking(@PathVariable String vehicleId) {
        Vehicle vehicle = vehicleService.getVehicleById(vehicleId);
        return ResponseEntity.ok(vehicle);
    }

    @PutMapping("/{vehicleId}")
    public ResponseEntity<Vehicle> updateTracking(
            @PathVariable String vehicleId,
            @Valid @RequestBody TrackingUpdateDto trackingDto) {
        Vehicle updated = vehicleService.updateTracking(vehicleId, trackingDto);
        return ResponseEntity.ok(updated);
    }
}
