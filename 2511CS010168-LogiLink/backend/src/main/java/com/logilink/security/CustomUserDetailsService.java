package com.logilink.security;

import com.logilink.entity.AppUser;
import com.logilink.repository.AppUserRepository;
import java.util.List;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailsService implements UserDetailsService {
  private final AppUserRepository users;

  public CustomUserDetailsService(AppUserRepository users) {
    this.users = users;
  }

  @Override
  public UserDetails loadUserByUsername(String email) {
    AppUser user = users.findByEmail(email).orElseThrow(() -> new UsernameNotFoundException("User not found"));
    return new User(user.email, user.passwordHash, user.active, true, true, true, List.of(new SimpleGrantedAuthority("ROLE_" + user.role.name())));
  }
}
