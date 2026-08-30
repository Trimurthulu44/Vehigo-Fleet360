package com.vehigo.service;

import com.vehigo.model.Subscription;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;

    @Autowired(required = false)
    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public boolean sendCredentialsEmail(Subscription subscription, String rawPassword) {
        String recipient = subscription.getOwnerEmail();
        String subject = "Welcome to VEHIGO — Your Account Credentials";
        String content = String.format(
            "Welcome to VEHIGO — Smart Vehicle & Fleet Management!\n\n" +
            "Dear %s,\n\n" +
            "Thank you for subscribing your business '%s' to VEHIGO.\n" +
            "Your subscription is now ACTIVE.\n\n" +
            "ACCOUNT LOGIN DETAILS:\n" +
            "-----------------------------------\n" +
            "Business Name: %s\n" +
            "Username / Email: %s\n" +
            "Temporary Password: %s\n" +
            "Selected Plan: %s\n" +
            "Amount Paid: ₹%.2f\n" +
            "Status: %s\n" +
            "Login URL: http://localhost:8080/login.html\n" +
            "-----------------------------------\n\n" +
            "Please log in and change your temporary password upon first access.\n\n" +
            "Best regards,\n" +
            "VEHIGO Fleet Operations Team\n" +
            "Developed by @Valteti Trimurthulu",
            subscription.getOwnerName(),
            subscription.getBusinessName(),
            subscription.getBusinessName(),
            subscription.getUsername(),
            rawPassword,
            subscription.getSelectedPlan(),
            subscription.getAmount(),
            subscription.getSubscriptionStatus()
        );

        // Development / Console Fallback Logger
        logger.info("==================================================================");
        logger.info("[VEHIGO EMAIL SERVICE] Dispatching credentials email to: {}", recipient);
        logger.info("Subject: {}", subject);
        logger.info("Body:\n{}", content);
        logger.info("==================================================================");

        if (mailSender != null) {
            try {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setTo(recipient);
                message.setSubject(subject);
                message.setText(content);
                mailSender.send(message);
                logger.info("[VEHIGO EMAIL SERVICE] Email sent successfully via SMTP.");
                return true;
            } catch (Exception e) {
                logger.warn("[VEHIGO EMAIL SERVICE] SMTP dispatch failed (development mode fallback active): {}", e.getMessage());
            }
        } else {
            logger.info("[VEHIGO EMAIL SERVICE] SMTP mail sender bean not configured. Development mode logging completed.");
        }
        return true;
    }
}
