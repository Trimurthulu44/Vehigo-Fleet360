package com.vehigo.service;

import com.vehigo.dto.PaymentRequestDto;
import com.vehigo.dto.SubscriptionRegistrationDto;
import com.vehigo.exception.BadRequestException;
import com.vehigo.exception.DuplicateResourceException;
import com.vehigo.exception.ResourceNotFoundException;
import com.vehigo.model.Subscription;
import com.vehigo.model.enums.PaymentStatus;
import com.vehigo.model.enums.SubscriptionStatus;
import com.vehigo.repository.SubscriptionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class SubscriptionService {

    private final SubscriptionRepository subscriptionRepository;
    private final EmailService emailService;

    @Autowired
    public SubscriptionService(SubscriptionRepository subscriptionRepository, EmailService emailService) {
        this.subscriptionRepository = subscriptionRepository;
        this.emailService = emailService;
    }

    public Subscription registerSubscription(SubscriptionRegistrationDto dto) {
        // Strict duplicate validation checks
        if (subscriptionRepository.findByUsername(dto.getUsername()).isPresent()) {
            throw new DuplicateResourceException("Username '" + dto.getUsername() + "' is already registered. Please choose another username.");
        }
        if (subscriptionRepository.findByOwnerEmail(dto.getOwnerEmail()).isPresent()) {
            throw new DuplicateResourceException("Email address '" + dto.getOwnerEmail() + "' is already registered. Please use another email address or login.");
        }
        if (dto.getPhone() != null && !dto.getPhone().isBlank() && subscriptionRepository.findByPhone(dto.getPhone()).isPresent()) {
            throw new DuplicateResourceException("Mobile number '" + dto.getPhone() + "' is already registered. Please use another mobile number.");
        }

        double amount = calculatePlanAmount(dto.getSelectedPlan());

        Subscription subscription = new Subscription();
        subscription.setBusinessName(dto.getBusinessName());
        subscription.setBusinessType(dto.getBusinessType());
        subscription.setBusinessRegNumber(dto.getBusinessRegNumber());
        subscription.setVehicleCount(dto.getVehicleCount() != null ? dto.getVehicleCount() : 5);
        subscription.setLocation(dto.getLocation());

        subscription.setOwnerName(dto.getOwnerName());
        subscription.setOwnerEmail(dto.getOwnerEmail());
        subscription.setPhone(dto.getPhone());

        subscription.setSelectedPlan(dto.getSelectedPlan());
        subscription.setAmount(amount);

        subscription.setUsername(dto.getUsername());
        subscription.setPassword(dto.getPassword()); // Stored for demo auth

        subscription.setSubscriptionStatus(SubscriptionStatus.PENDING);
        subscription.setPaymentStatus(PaymentStatus.PENDING);
        subscription.setCreatedAt(LocalDateTime.now());
        subscription.setUpdatedAt(LocalDateTime.now());

        return subscriptionRepository.save(subscription);
    }

    public Subscription processPayment(String subscriptionId, PaymentRequestDto paymentDto) {
        Subscription subscription = subscriptionRepository.findById(subscriptionId)
            .orElseThrow(() -> new ResourceNotFoundException("Subscription not found with ID: " + subscriptionId));

        LocalDateTime now = LocalDateTime.now();
        subscription.setStartDate(now);
        subscription.setExpiryDate(calculateExpiryDate(now, subscription.getSelectedPlan()));

        subscription.setPaymentStatus(PaymentStatus.SUCCESS);
        subscription.setSubscriptionStatus(SubscriptionStatus.ACTIVE);
        subscription.setUpdatedAt(now);

        Subscription updated = subscriptionRepository.save(subscription);

        // Send confirmation credentials email
        emailService.sendCredentialsEmail(updated, updated.getPassword());

        return updated;
    }

    public Subscription resetPassword(String usernameOrEmail, String newPassword) {
        Subscription sub = subscriptionRepository.findByUsername(usernameOrEmail)
            .or(() -> subscriptionRepository.findByOwnerEmail(usernameOrEmail))
            .orElseThrow(() -> new ResourceNotFoundException("No registered account found for username or email: " + usernameOrEmail));

        sub.setPassword(newPassword);
        sub.setUpdatedAt(LocalDateTime.now());
        return subscriptionRepository.save(sub);
    }

    public Subscription getSubscriptionById(String id) {
        return subscriptionRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Subscription not found with ID: " + id));
    }

    public List<Subscription> getAllSubscriptions() {
        return subscriptionRepository.findAll();
    }

    private double calculatePlanAmount(String plan) {
        if (plan == null) return 4999.0;
        switch (plan.toUpperCase()) {
            case "6_MONTH":
            case "6MONTH":
                return 2999.0;
            case "1_YEAR":
            case "1YEAR":
                return 4999.0;
            case "3_YEAR":
            case "3YEAR":
                return 11999.0;
            case "5_YEAR":
            case "5YEAR":
                return 17999.0;
            default:
                return 4999.0;
        }
    }

    private LocalDateTime calculateExpiryDate(LocalDateTime start, String plan) {
        if (plan == null) return start.plusYears(1);
        switch (plan.toUpperCase()) {
            case "6_MONTH":
            case "6MONTH":
                return start.plusMonths(6);
            case "1_YEAR":
            case "1YEAR":
                return start.plusYears(1);
            case "3_YEAR":
            case "3YEAR":
                return start.plusYears(3);
            case "5_YEAR":
            case "5YEAR":
                return start.plusYears(5);
            default:
                return start.plusYears(1);
        }
    }
}
