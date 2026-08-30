package com.vehigo.controller;

import com.vehigo.model.Maintenance;
import com.vehigo.service.MaintenanceService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/maintenance")
public class MaintenanceController {

    private final MaintenanceService maintenanceService;

    @Autowired
    public MaintenanceController(MaintenanceService maintenanceService) {
        this.maintenanceService = maintenanceService;
    }

    @GetMapping
    public ResponseEntity<List<Maintenance>> getAllMaintenance(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String vehicleId) {
        List<Maintenance> records = maintenanceService.getAllMaintenance(status, vehicleId);
        return ResponseEntity.ok(records);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Maintenance> getMaintenanceById(@PathVariable String id) {
        Maintenance record = maintenanceService.getMaintenanceById(id);
        return ResponseEntity.ok(record);
    }

    @PostMapping
    public ResponseEntity<Maintenance> createMaintenance(@Valid @RequestBody Maintenance maintenance) {
        Maintenance created = maintenanceService.createMaintenance(maintenance);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Maintenance> updateMaintenance(@PathVariable String id, @RequestBody Maintenance maintenance) {
        Maintenance updated = maintenanceService.updateMaintenance(id, maintenance);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMaintenance(@PathVariable String id) {
        maintenanceService.deleteMaintenance(id);
        return ResponseEntity.noContent().build();
    }
}
