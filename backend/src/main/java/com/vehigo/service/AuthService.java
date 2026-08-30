package com.vehigo.service;

import com.vehigo.dto.LoginRequestDto;
import com.vehigo.dto.LoginResponseDto;
import com.vehigo.model.Subscription;
import com.vehigo.model.enums.SubscriptionStatus;
import com.vehigo.repository.SubscriptionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthService {

    private final SubscriptionRepository subscriptionRepository;

    @Autowired
    public AuthService(SubscriptionRepository subscriptionRepository) {
        this.subscriptionRepository = subscriptionRepository;
    }

    public LoginResponseDto authenticate(LoginRequestDto request) {
        String inputUser = request.getUsername() != null ? request.getUsername().trim() : "";
        String inputPass = request.getPassword() != null ? request.getPassword().trim() : "";

        // 1. Static Demo Admin Fallback
        if ("admin".equalsIgnoreCase(inputUser) && "admin123".equals(inputPass)) {
            return new LoginResponseDto(
                true,
                "admin",
                "VEHIGO Master Admin Fleet",
                "Fleet Operations Manager",
                "admin@vehigo.com",
                "ACTIVE",
                "Master Admin Login Successful"
            );
        }

        // 2. Dynamic Subscription Account Check (by Username or Email)
        Optional<Subscription> subOpt = subscriptionRepository.findByUsername(inputUser);
        if (subOpt.isEmpty()) {
            subOpt = subscriptionRepository.findByOwnerEmail(inputUser);
        }

        if (subOpt.isPresent()) {
            Subscription sub = subOpt.get();
            if (sub.getPassword().equals(inputPass)) {
                if (sub.getSubscriptionStatus() != SubscriptionStatus.ACTIVE) {
                    return new LoginResponseDto(
                        false,
                        sub.getUsername(),
                        sub.getBusinessName(),
                        sub.getOwnerName(),
                        sub.getOwnerEmail(),
                        sub.getSubscriptionStatus().name(),
                        "Subscription is " + sub.getSubscriptionStatus() + ". Please complete payment to activate."
                    );
                }

                return new LoginResponseDto(
                    true,
                    sub.getUsername(),
                    sub.getBusinessName(),
                    sub.getOwnerName(),
                    sub.getOwnerEmail(),
                    sub.getSubscriptionStatus().name(),
                    "Welcome back to " + sub.getBusinessName() + "!"
                );
            }
        }

        return new LoginResponseDto(
            false,
            inputUser,
            null,
            null,
            null,
            null,
            "Invalid username or password"
        );
    }
}
