package com.vehigo.repository;

import com.vehigo.model.Subscription;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SubscriptionRepository extends MongoRepository<Subscription, String> {
    Optional<Subscription> findByUsername(String username);
    Optional<Subscription> findByOwnerEmail(String ownerEmail);
}
