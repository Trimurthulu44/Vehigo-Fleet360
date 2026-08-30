package com.vehigo.dto;

public class LoginResponseDto {
    private boolean authenticated;
    private String username;
    private String businessName;
    private String ownerName;
    private String ownerEmail;
    private String subscriptionStatus;
    private String message;

    public LoginResponseDto() {}

    public LoginResponseDto(boolean authenticated, String username, String businessName, String ownerName, String ownerEmail, String subscriptionStatus, String message) {
        this.authenticated = authenticated;
        this.username = username;
        this.businessName = businessName;
        this.ownerName = ownerName;
        this.ownerEmail = ownerEmail;
        this.subscriptionStatus = subscriptionStatus;
        this.message = message;
    }

    public boolean isAuthenticated() { return authenticated; }
    public void setAuthenticated(boolean authenticated) { this.authenticated = authenticated; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getBusinessName() { return businessName; }
    public void setBusinessName(String businessName) { this.businessName = businessName; }

    public String getOwnerName() { return ownerName; }
    public void setOwnerName(String ownerName) { this.ownerName = ownerName; }

    public String getOwnerEmail() { return ownerEmail; }
    public void setOwnerEmail(String ownerEmail) { this.ownerEmail = ownerEmail; }

    public String getSubscriptionStatus() { return subscriptionStatus; }
    public void setSubscriptionStatus(String subscriptionStatus) { this.subscriptionStatus = subscriptionStatus; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}
