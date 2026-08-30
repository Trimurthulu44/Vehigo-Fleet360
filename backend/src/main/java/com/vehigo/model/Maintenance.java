package com.vehigo.model;

import com.vehigo.model.enums.MaintenanceStatus;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Document(collection = "maintenance")
public class Maintenance {

    @Id
    private String id;

    private String vehicleId;
    private String serviceType;
    private String description;
    private LocalDate serviceDate;
    private LocalDate nextServiceDate;
    private Double cost;
    private MaintenanceStatus status;
    private String notes;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public Maintenance() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.status = MaintenanceStatus.SCHEDULED;
    }

    public Maintenance(String id, String vehicleId, String serviceType, String description,
                       LocalDate serviceDate, LocalDate nextServiceDate, Double cost,
                       MaintenanceStatus status, String notes) {
        this.id = id;
        this.vehicleId = vehicleId;
        this.serviceType = serviceType;
        this.description = description;
        this.serviceDate = serviceDate;
        this.nextServiceDate = nextServiceDate;
        this.cost = cost;
        this.status = status != null ? status : MaintenanceStatus.SCHEDULED;
        this.notes = notes;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getVehicleId() { return vehicleId; }
    public void setVehicleId(String vehicleId) { this.vehicleId = vehicleId; }

    public String getServiceType() { return serviceType; }
    public void setServiceType(String serviceType) { this.serviceType = serviceType; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public LocalDate getServiceDate() { return serviceDate; }
    public void setServiceDate(LocalDate serviceDate) { this.serviceDate = serviceDate; }

    public LocalDate getNextServiceDate() { return nextServiceDate; }
    public void setNextServiceDate(LocalDate nextServiceDate) { this.nextServiceDate = nextServiceDate; }

    public Double getCost() { return cost; }
    public void setCost(Double cost) { this.cost = cost; }

    public MaintenanceStatus getStatus() { return status; }
    public void setStatus(MaintenanceStatus status) { this.status = status; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
