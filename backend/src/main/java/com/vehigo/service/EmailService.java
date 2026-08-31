package com.vehigo.service;

import com.vehigo.model.Subscription;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    public boolean sendCredentialsEmail(Subscription subscription, String rawPassword) {
        // Fast local log - no SMTP network calls or delays
        logger.info("[VEHIGO SERVICE] Account activated for business: '{}' (Username: {})", 
                subscription.getBusinessName(), subscription.getUsername());
        return true;
    }
}
