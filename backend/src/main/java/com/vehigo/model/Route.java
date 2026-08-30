package com.vehigo.model;

import com.vehigo.model.enums.RouteStatus;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "routes")
public class Route {

    @Id
    private String id;

    private String routeName;
    private String source;
    private String destination;
    private Double distance; // in km
    private String estimatedDuration; // e.g. "5 hrs 30 mins"
    private RouteStatus status;

    private String vehicleId;
    private String driverId;

    private LocalDateTime departureTime;
    private LocalDateTime arrivalTime;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public Route() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.status = RouteStatus.PLANNED;
    }

    public Route(String id, String routeName, String source, String destination, Double distance,
                 String estimatedDuration, RouteStatus status, String vehicleId, String driverId,
                 LocalDateTime departureTime, LocalDateTime arrivalTime) {
        this.id = id;
        this.routeName = routeName;
        this.source = source;
        this.destination = destination;
        this.distance = distance;
        this.estimatedDuration = estimatedDuration;
        this.status = status != null ? status : RouteStatus.PLANNED;
        this.vehicleId = vehicleId;
        this.driverId = driverId;
        this.departureTime = departureTime;
        this.arrivalTime = arrivalTime;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getRouteName() { return routeName; }
    public void setRouteName(String routeName) { this.routeName = routeName; }

    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }

    public String getDestination() { return destination; }
    public void setDestination(String destination) { this.destination = destination; }

    public Double getDistance() { return distance; }
    public void setDistance(Double distance) { this.distance = distance; }

    public String getEstimatedDuration() { return estimatedDuration; }
    public void setEstimatedDuration(String estimatedDuration) { this.estimatedDuration = estimatedDuration; }

    public RouteStatus getStatus() { return status; }
    public void setStatus(RouteStatus status) { this.status = status; }

    public String getVehicleId() { return vehicleId; }
    public void setVehicleId(String vehicleId) { this.vehicleId = vehicleId; }

    public String getDriverId() { return driverId; }
    public void setDriverId(String driverId) { this.driverId = driverId; }

    public LocalDateTime getDepartureTime() { return departureTime; }
    public void setDepartureTime(LocalDateTime departureTime) { this.departureTime = departureTime; }

    public LocalDateTime getArrivalTime() { return arrivalTime; }
    public void setArrivalTime(LocalDateTime arrivalTime) { this.arrivalTime = arrivalTime; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
