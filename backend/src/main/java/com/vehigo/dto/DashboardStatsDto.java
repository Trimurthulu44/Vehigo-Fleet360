package com.vehigo.dto;

public class DashboardStatsDto {

    private long totalVehicles;
    private long availableVehicles;
    private long vehiclesOnTrip;
    private long vehiclesInMaintenance;
    private long inactiveVehicles;

    private long totalDrivers;
    private long availableDrivers;
    private long driversOnTrip;

    private long totalRoutes;
    private long activeRoutes;
    private long completedRoutes;
    private long plannedRoutes;

    private long upcomingMaintenance;
    private double totalMaintenanceCost;

    public DashboardStatsDto() {}

    // Getters and Setters
    public long getTotalVehicles() { return totalVehicles; }
    public void setTotalVehicles(long totalVehicles) { this.totalVehicles = totalVehicles; }

    public long getAvailableVehicles() { return availableVehicles; }
    public void setAvailableVehicles(long availableVehicles) { this.availableVehicles = availableVehicles; }

    public long getVehiclesOnTrip() { return vehiclesOnTrip; }
    public void setVehiclesOnTrip(long vehiclesOnTrip) { this.vehiclesOnTrip = vehiclesOnTrip; }

    public long getVehiclesInMaintenance() { return vehiclesInMaintenance; }
    public void setVehiclesInMaintenance(long vehiclesInMaintenance) { this.vehiclesInMaintenance = vehiclesInMaintenance; }

    public long getInactiveVehicles() { return inactiveVehicles; }
    public void setInactiveVehicles(long inactiveVehicles) { this.inactiveVehicles = inactiveVehicles; }

    public long getTotalDrivers() { return totalDrivers; }
    public void setTotalDrivers(long totalDrivers) { this.totalDrivers = totalDrivers; }

    public long getAvailableDrivers() { return availableDrivers; }
    public void setAvailableDrivers(long availableDrivers) { this.availableDrivers = availableDrivers; }

    public long getDriversOnTrip() { return driversOnTrip; }
    public void setDriversOnTrip(long driversOnTrip) { this.driversOnTrip = driversOnTrip; }

    public long getTotalRoutes() { return totalRoutes; }
    public void setTotalRoutes(long totalRoutes) { this.totalRoutes = totalRoutes; }

    public long getActiveRoutes() { return activeRoutes; }
    public void setActiveRoutes(long activeRoutes) { this.activeRoutes = activeRoutes; }

    public long getCompletedRoutes() { return completedRoutes; }
    public void setCompletedRoutes(long completedRoutes) { this.completedRoutes = completedRoutes; }

    public long getPlannedRoutes() { return plannedRoutes; }
    public void setPlannedRoutes(long plannedRoutes) { this.plannedRoutes = plannedRoutes; }

    public long getUpcomingMaintenance() { return upcomingMaintenance; }
    public void setUpcomingMaintenance(long upcomingMaintenance) { this.upcomingMaintenance = upcomingMaintenance; }

    public double getTotalMaintenanceCost() { return totalMaintenanceCost; }
    public void setTotalMaintenanceCost(double totalMaintenanceCost) { this.totalMaintenanceCost = totalMaintenanceCost; }
}
