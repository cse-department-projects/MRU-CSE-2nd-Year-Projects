package com.logilink.repository;

import com.logilink.entity.AppUser;
import com.logilink.entity.PasswordResetToken;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {
  @EntityGraph(attributePaths = {"user", "user.organization"})
  Optional<PasswordResetToken> findByToken(String token);

  @Modifying
  @Query("UPDATE PasswordResetToken t SET t.used = true WHERE t.user = :user AND t.used = false")
  void invalidateAllTokensForUser(@Param("user") AppUser user);
}
