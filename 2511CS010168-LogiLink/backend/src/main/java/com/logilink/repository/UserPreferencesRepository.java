package com.logilink.repository;

import com.logilink.entity.AppUser;
import com.logilink.entity.UserPreferences;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserPreferencesRepository extends JpaRepository<UserPreferences, Long> {
  Optional<UserPreferences> findByUser(AppUser user);
  Optional<UserPreferences> findByUserId(Long userId);
}
