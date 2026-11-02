package com.logilink.security;

import com.logilink.entity.AppUser;
import com.logilink.entity.Organization;
import com.logilink.exception.ResourceNotFoundException;
import com.logilink.repository.AppUserRepository;
import java.util.Optional;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
public class TenantContext {
  private final AppUserRepository users;

  public TenantContext(AppUserRepository users) {
    this.users = users;
  }

  public Optional<AppUser> findCurrentUser() {
    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
    if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
      return Optional.empty();
    }
    return users.findByEmail(auth.getName());
  }

  public AppUser getCurrentUser() {
    return findCurrentUser().orElseThrow(() -> new AccessDeniedException("User is not authenticated."));
  }

  public Organization getCurrentOrganization() {
    AppUser user = getCurrentUser();
    if (user.organization == null) {
      throw new AccessDeniedException("User does not belong to any organization.");
    }
    return user.organization;
  }
}
