package com.vehigo.service;

import com.vehigo.model.Subscription;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:#{null}}")
    private String mailUsername;

    @Autowired(required = false)
    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public boolean sendCredentialsEmail(Subscription subscription, String rawPassword) {
        String recipient = subscription.getOwnerEmail();
        String subject = "🎉 Welcome to the VEHIGO Family! Your Subscription is Active";
        String content = String.format(
            "======================================================================\n" +
            "            🎉 WELCOME TO THE VEHIGO FAMILY! 🎉\n" +
            "======================================================================\n\n" +
            "Dear %s,\n\n" +
            "Welcome aboard! We are thrilled to have your business '%s' join the VEHIGO SaaS Fleet Management family.\n\n" +
            "Your subscription payment has been successfully processed and your account is now ACTIVE.\n\n" +
            "YOUR REGISTERED ACCOUNT ACCESS DETAILS:\n" +
            "----------------------------------------------------------------------\n" +
            "Company / Business Name : %s\n" +
            "Business Type           : %s\n" +
            "Registered Username     : %s\n" +
            "Owner Email             : %s\n" +
            "Selected Subscription   : %s\n" +
            "Amount Paid             : ₹%.2f\n" +
            "Subscription Status     : ACTIVE\n" +
            "Login Portal URL        : https://trimurthulu44.github.io/Vehigo-Fleet360/frontend/login.html\n" +
            "----------------------------------------------------------------------\n\n" +
            "HOW TO ACCESS YOUR FLEET DASHBOARD:\n" +
            "1. Visit the Login Portal URL above.\n" +
            "2. Enter your registered Username (%s) and your Password.\n" +
            "3. Start adding vehicles, tracking live telematics location, assigning drivers, and managing maintenance!\n\n" +
            "Thank you for trusting VEHIGO to power your fleet operations.\n\n" +
            "Best regards,\n" +
            "VEHIGO Fleet Operations Team\n" +
            "Developed by @Valteti Trimurthulu",
            subscription.getOwnerName(),
            subscription.getBusinessName(),
            subscription.getBusinessName(),
            subscription.getBusinessType() != null ? subscription.getBusinessType() : "Transport",
            subscription.getUsername(),
            subscription.getOwnerEmail(),
            subscription.getSelectedPlan(),
            subscription.getAmount(),
            subscription.getUsername()
        );

        String senderAddress = (mailUsername != null && !mailUsername.trim().isEmpty()) ? mailUsername.trim() : "vehigo.saas@gmail.com";

        // Log formatted email to console for development visibility
        logger.info("==================================================================");
        logger.info("[VEHIGO EMAIL SERVICE] Dispatching 'Welcome to the Family' email to: {}", recipient);
        logger.info("From: {}", senderAddress);
        logger.info("Subject: {}", subject);
        logger.info("Body:\n{}", content);
        logger.info("==================================================================");

        if (mailSender != null && mailUsername != null && !mailUsername.trim().isEmpty()) {
            try {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setFrom(senderAddress);
                message.setTo(recipient);
                message.setSubject(subject);
                message.setText(content);
                mailSender.send(message);
                logger.info("[VEHIGO EMAIL SERVICE] Welcome email sent successfully via SMTP to {}", recipient);
                return true;
            } catch (Exception e) {
                logger.error("[VEHIGO EMAIL SERVICE] SMTP dispatch error: ", e);
            }
        } else {
            logger.info("[VEHIGO EMAIL SERVICE] SMTP mail sender credentials not configured. Development mode logging completed.");
        }
        return true;
    }
}
