package com.vehigo.controller;

import com.vehigo.dto.PaymentRequestDto;
import com.vehigo.dto.SubscriptionRegistrationDto;
import com.vehigo.model.Subscription;
import com.vehigo.service.SubscriptionService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/subscriptions")
public class SubscriptionController {

    private final SubscriptionService subscriptionService;

    @Autowired
    public SubscriptionController(SubscriptionService subscriptionService) {
        this.subscriptionService = subscriptionService;
    }

    @PostMapping("/register")
    public ResponseEntity<Subscription> register(@Valid @RequestBody SubscriptionRegistrationDto dto) {
        Subscription subscription = subscriptionService.registerSubscription(dto);
        return new ResponseEntity<>(subscription, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Subscription> getById(@PathVariable String id) {
        Subscription subscription = subscriptionService.getSubscriptionById(id);
        return ResponseEntity.ok(subscription);
    }

    @GetMapping
    public ResponseEntity<List<Subscription>> getAll() {
        List<Subscription> subscriptions = subscriptionService.getAllSubscriptions();
        return ResponseEntity.ok(subscriptions);
    }

    @PostMapping("/{id}/payment")
    public ResponseEntity<Subscription> processPayment(
            @PathVariable String id,
            @RequestBody(required = false) PaymentRequestDto paymentDto) {
        if (paymentDto == null) {
            paymentDto = new PaymentRequestDto();
            paymentDto.setPaymentMethod("DEMO_CHECKOUT");
        }
        Subscription updated = subscriptionService.processPayment(id, paymentDto);
        return ResponseEntity.ok(updated);
    }

    @GetMapping("/status/{id}")
    public ResponseEntity<Map<String, Object>> getStatus(@PathVariable String id) {
        Subscription sub = subscriptionService.getSubscriptionById(id);
        return ResponseEntity.ok(Map.of(
            "id", sub.getId(),
            "businessName", sub.getBusinessName(),
            "subscriptionStatus", sub.getSubscriptionStatus(),
            "paymentStatus", sub.getPaymentStatus(),
            "expiryDate", sub.getExpiryDate() != null ? sub.getExpiryDate() : ""
        ));
    }
}
