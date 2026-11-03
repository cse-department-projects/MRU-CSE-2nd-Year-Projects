package com.hms.config;

import com.hms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Runs once on startup to ensure the seeded doctor and patient accounts
 * use the real-world email addresses for testing appointment email alerts.
 *
 * Safe to run on an already-seeded DB — only updates if the old email exists.
 */
@Component
@RequiredArgsConstructor
@Slf4j
@Order(10)  // Run after DataSeeder (which is a CommandLineRunner)
public class EmailUpdateRunner implements ApplicationRunner {

    private static final String DOCTOR_OLD_EMAIL  = "dr.rajesh@hms.com";
    private static final String DOCTOR_NEW_EMAIL  = "gbhavana797@gmail.com";

    private static final String PATIENT_OLD_EMAIL = "rahul.patient@hms.com";
    private static final String PATIENT_NEW_EMAIL = "jvedavanshika@gmail.com";

    private final UserRepository userRepository;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        updateEmail(DOCTOR_OLD_EMAIL, DOCTOR_NEW_EMAIL, "Doctor (Rajesh Kumar)");
        updateEmail(PATIENT_OLD_EMAIL, PATIENT_NEW_EMAIL, "Patient (Rahul Singh)");
    }

    private void updateEmail(String oldEmail, String newEmail, String label) {
        // If the target email already exists in the DB, nothing to do
        if (userRepository.existsByEmail(newEmail)) {
            log.info("{} already uses the target email: {}", label, newEmail);
            return;
        }

        // Otherwise try to find user by old email and update
        userRepository.findByEmail(oldEmail).ifPresentOrElse(
            user -> {
                user.setEmail(newEmail);
                userRepository.save(user);
                log.info("Updated {} email: {} -> {}", label, oldEmail, newEmail);
            },
            () -> log.warn("Could not find {} with old email: {} (may already be updated)", label, oldEmail)
        );
    }
}
