package com.logilink.service;

import com.logilink.dto.AuthDtos.UserResponse;
import com.logilink.entity.ActivityLog;
import com.logilink.entity.AppUser;
import com.logilink.entity.Organization;
import com.logilink.entity.UserPreferences;
import com.logilink.exception.ConflictException;
import com.logilink.repository.ActivityLogRepository;
import com.logilink.repository.AppUserRepository;
import com.logilink.repository.OrganizationRepository;
import com.logilink.repository.UserPreferencesRepository;
import com.logilink.security.JwtService;
import com.logilink.security.TenantContext;
import java.util.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SettingsService {
  private final AppUserRepository users;
  private final OrganizationRepository organizations;
  private final UserPreferencesRepository preferences;
  private final ActivityLogRepository activityLogs;
  private final TenantContext tenantContext;
  private final JwtService jwt;

  public SettingsService(
      AppUserRepository users,
      OrganizationRepository organizations,
      UserPreferencesRepository preferences,
      ActivityLogRepository activityLogs,
      TenantContext tenantContext,
      JwtService jwt) {
    this.users = users;
    this.organizations = organizations;
    this.preferences = preferences;
    this.activityLogs = activityLogs;
    this.tenantContext = tenantContext;
    this.jwt = jwt;
  }

  @Transactional
  public UserPreferences getOrCreatePreferences(AppUser user) {
    return preferences.findByUserId(user.id).orElseGet(() -> {
      UserPreferences p = new UserPreferences(user);
      return preferences.save(p);
    });
  }

  @Transactional
  public Map<String, Object> getSettings() {
    AppUser user = tenantContext.getCurrentUser();
    Organization org = user.organization;
    UserPreferences prefs = getOrCreatePreferences(user);

    Map<String, Object> profile = new LinkedHashMap<>();
    profile.put("fullName", user.name != null ? user.name : "");
    profile.put("email", user.email != null ? user.email : "");
    profile.put("role", user.role != null ? user.role.name() : "");

    Map<String, Object> company = new LinkedHashMap<>();
    company.put("companyName", org != null && org.name != null ? org.name : "");
    company.put("organizationCode", org != null && org.code != null ? org.code : "");
    company.put("operatingRegion", org != null && org.operatingRegion != null ? org.operatingRegion : "India National");

    Map<String, Object> notifications = new LinkedHashMap<>();
    notifications.put("alertThreshold", prefs.alertThreshold != null ? prefs.alertThreshold : "Default");
    notifications.put("digestFrequency", prefs.digestFrequency != null ? prefs.digestFrequency : "Daily");

    if (prefs.theme != null && !prefs.theme.equalsIgnoreCase("Light")) {
      prefs.theme = "Light";
      prefs = preferences.save(prefs);
    }

    Map<String, Object> appearance = new LinkedHashMap<>();
    appearance.put("theme", "Light");
    appearance.put("density", prefs.density != null ? prefs.density : "Default");

    Map<String, Object> security = new LinkedHashMap<>();
    security.put("sessionPolicy", prefs.sessionPolicy != null ? prefs.sessionPolicy : "Standard (24h)");
    security.put("passwordPolicy", prefs.passwordPolicy != null ? prefs.passwordPolicy : "Strong");

    Map<String, Object> system = new LinkedHashMap<>();
    system.put("timezone", prefs.timezone != null ? prefs.timezone : "Asia/Kolkata (IST)");
    system.put("defaultWarehouse", prefs.defaultWarehouse != null ? prefs.defaultWarehouse : "WH-HYD-CEN");

    Map<String, Object> result = new LinkedHashMap<>();
    result.put("profile", profile);
    result.put("company", company);
    result.put("notifications", notifications);
    result.put("appearance", appearance);
    result.put("security", security);
    result.put("system", system);

    return result;
  }

  @Transactional
  public Map<String, Object> updateProfile(Map<String, Object> body) {
    AppUser user = tenantContext.getCurrentUser();
    String newName = body.containsKey("fullName") ? String.valueOf(body.get("fullName")).trim() : null;
    if (newName == null || newName.isBlank()) {
      if (body.containsKey("name")) newName = String.valueOf(body.get("name")).trim();
    }
    String newEmail = body.containsKey("email") ? String.valueOf(body.get("email")).trim() : null;

    boolean updated = false;
    if (newName != null && !newName.isBlank() && !newName.equals(user.name)) {
      user.name = newName;
      updated = true;
    }

    boolean emailChanged = false;
    if (newEmail != null && !newEmail.isBlank() && !newEmail.equalsIgnoreCase(user.email)) {
      if (users.existsByEmail(newEmail)) {
        throw new ConflictException("Email is already registered: " + newEmail);
      }
      user.email = newEmail;
      updated = true;
      emailChanged = true;
    }

    if (updated) {
      user = users.save(user);
      logActivity(user, user.organization, "UPDATE", "User", String.valueOf(user.id), "Updated profile details for " + user.name);
    }

    String token = emailChanged ? jwt.generate(user) : null;
    UserResponse userResp = toUserResponse(user);

    Map<String, Object> profile = new LinkedHashMap<>();
    profile.put("fullName", user.name);
    profile.put("email", user.email);
    profile.put("role", user.role != null ? user.role.name() : "");
    if (token != null) profile.put("token", token);
    profile.put("user", userResp);

    return profile;
  }

  @Transactional
  public Map<String, Object> updateCompany(Map<String, Object> body) {
    AppUser user = tenantContext.getCurrentUser();
    Organization org = tenantContext.getCurrentOrganization();

    String newName = body.containsKey("companyName") ? String.valueOf(body.get("companyName")).trim() : null;
    if (newName == null || newName.isBlank()) {
      if (body.containsKey("name")) newName = String.valueOf(body.get("name")).trim();
    }
    String newRegion = body.containsKey("operatingRegion") ? String.valueOf(body.get("operatingRegion")).trim() : null;

    boolean updated = false;
    if (newName != null && !newName.isBlank() && !newName.equals(org.name)) {
      org.name = newName;
      updated = true;
    }
    if (newRegion != null && !newRegion.isBlank() && !newRegion.equals(org.operatingRegion)) {
      org.operatingRegion = newRegion;
      updated = true;
    }

    if (updated) {
      org = organizations.save(org);
      logActivity(user, org, "UPDATE", "Organization", org.code, "Updated company settings for " + org.name);
    }

    Map<String, Object> company = new LinkedHashMap<>();
    company.put("companyName", org.name);
    company.put("organizationCode", org.code);
    company.put("operatingRegion", org.operatingRegion != null ? org.operatingRegion : "India National");
    return company;
  }

  @Transactional
  public Map<String, Object> updateNotifications(Map<String, Object> body) {
    AppUser user = tenantContext.getCurrentUser();
    UserPreferences prefs = getOrCreatePreferences(user);

    if (body.containsKey("alertThreshold")) {
      String at = String.valueOf(body.get("alertThreshold")).trim();
      if (!at.isBlank()) prefs.alertThreshold = at;
    }
    if (body.containsKey("digestFrequency")) {
      String df = String.valueOf(body.get("digestFrequency")).trim();
      if (!df.isBlank()) prefs.digestFrequency = df;
    }

    prefs = preferences.save(prefs);
    logActivity(user, user.organization, "UPDATE", "User", String.valueOf(user.id), "Updated notification preferences");

    Map<String, Object> result = new LinkedHashMap<>();
    result.put("alertThreshold", prefs.alertThreshold);
    result.put("digestFrequency", prefs.digestFrequency);
    return result;
  }

  @Transactional
  public Map<String, Object> updateAppearance(Map<String, Object> body) {
    AppUser user = tenantContext.getCurrentUser();
    UserPreferences prefs = getOrCreatePreferences(user);

    prefs.theme = "Light";
    if (body.containsKey("density")) {
      String d = String.valueOf(body.get("density")).trim();
      if (!d.isBlank()) prefs.density = d;
    }

    prefs = preferences.save(prefs);
    logActivity(user, user.organization, "UPDATE", "User", String.valueOf(user.id), "Updated appearance preferences (" + prefs.theme + " / " + prefs.density + ")");

    Map<String, Object> result = new LinkedHashMap<>();
    result.put("theme", prefs.theme);
    result.put("density", prefs.density);
    return result;
  }

  @Transactional
  public Map<String, Object> updateSecurity(Map<String, Object> body) {
    AppUser user = tenantContext.getCurrentUser();
    UserPreferences prefs = getOrCreatePreferences(user);

    if (body.containsKey("sessionPolicy")) {
      String sp = String.valueOf(body.get("sessionPolicy")).trim();
      if (!sp.isBlank()) prefs.sessionPolicy = sp;
    }
    if (body.containsKey("passwordPolicy")) {
      String pp = String.valueOf(body.get("passwordPolicy")).trim();
      if (!pp.isBlank()) prefs.passwordPolicy = pp;
    }

    prefs = preferences.save(prefs);
    logActivity(user, user.organization, "UPDATE", "User", String.valueOf(user.id), "Updated security settings");

    Map<String, Object> result = new LinkedHashMap<>();
    result.put("sessionPolicy", prefs.sessionPolicy);
    result.put("passwordPolicy", prefs.passwordPolicy);
    return result;
  }

  @Transactional
  public Map<String, Object> updateSystem(Map<String, Object> body) {
    AppUser user = tenantContext.getCurrentUser();
    UserPreferences prefs = getOrCreatePreferences(user);

    if (body.containsKey("timezone")) {
      String tz = String.valueOf(body.get("timezone")).trim();
      if (!tz.isBlank()) prefs.timezone = tz;
    }
    if (body.containsKey("defaultWarehouse")) {
      String dw = String.valueOf(body.get("defaultWarehouse")).trim();
      if (!dw.isBlank()) prefs.defaultWarehouse = dw;
    }

    prefs = preferences.save(prefs);
    logActivity(user, user.organization, "UPDATE", "User", String.valueOf(user.id), "Updated system preferences");

    Map<String, Object> result = new LinkedHashMap<>();
    result.put("timezone", prefs.timezone);
    result.put("defaultWarehouse", prefs.defaultWarehouse);
    return result;
  }

  private void logActivity(AppUser user, Organization org, String action, String entityType, String entityId, String description) {
    try {
      activityLogs.save(new ActivityLog(user, org, action, entityType, entityId, description));
    } catch (Exception ignored) {}
  }

  private UserResponse toUserResponse(AppUser user) {
    Organization org = user.organization;
    return new UserResponse(
        user.id,
        user.name,
        user.email,
        user.role.name(),
        user.active,
        org != null ? org.id : null,
        org != null ? org.name : null,
        org != null ? org.code : null,
        org != null && org.type != null ? org.type.name() : null
    );
  }
}
