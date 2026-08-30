package com.vehigo.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class TrackingUpdateDto {

    @NotBlank(message = "Current location is required")
    private String currentLocation;

    @NotNull(message = "Latitude is required")
    private Double latitude;

    @NotNull(message = "Longitude is required")
    private Double longitude;

    private String vehicleStatus; // Optional status update during tracking

    public TrackingUpdateDto() {}

    public TrackingUpdateDto(String currentLocation, Double latitude, Double longitude, String vehicleStatus) {
        this.currentLocation = currentLocation;
        this.latitude = latitude;
        this.longitude = longitude;
        this.vehicleStatus = vehicleStatus;
    }

    public String getCurrentLocation() { return currentLocation; }
    public void setCurrentLocation(String currentLocation) { this.currentLocation = currentLocation; }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }

    public String getVehicleStatus() { return vehicleStatus; }
    public void setVehicleStatus(String vehicleStatus) { this.vehicleStatus = vehicleStatus; }
}
