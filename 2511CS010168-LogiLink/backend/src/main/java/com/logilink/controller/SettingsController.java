package com.logilink.controller;

import com.logilink.service.SettingsService;
import java.util.Map;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/settings")
public class SettingsController {
  private final SettingsService settingsService;

  public SettingsController(SettingsService settingsService) {
    this.settingsService = settingsService;
  }

  @GetMapping
  public Map<String, Object> getSettings() {
    return settingsService.getSettings();
  }

  @RequestMapping(value = "/profile", method = {RequestMethod.PUT, RequestMethod.PATCH})
  public Map<String, Object> updateProfile(@RequestBody Map<String, Object> body) {
    return settingsService.updateProfile(body);
  }

  @RequestMapping(value = "/company", method = {RequestMethod.PUT, RequestMethod.PATCH})
  public Map<String, Object> updateCompany(@RequestBody Map<String, Object> body) {
    return settingsService.updateCompany(body);
  }

  @RequestMapping(value = "/notifications", method = {RequestMethod.PUT, RequestMethod.PATCH})
  public Map<String, Object> updateNotifications(@RequestBody Map<String, Object> body) {
    return settingsService.updateNotifications(body);
  }

  @RequestMapping(value = "/appearance", method = {RequestMethod.PUT, RequestMethod.PATCH})
  public Map<String, Object> updateAppearance(@RequestBody Map<String, Object> body) {
    return settingsService.updateAppearance(body);
  }

  @RequestMapping(value = "/security", method = {RequestMethod.PUT, RequestMethod.PATCH})
  public Map<String, Object> updateSecurity(@RequestBody Map<String, Object> body) {
    return settingsService.updateSecurity(body);
  }

  @RequestMapping(value = "/system", method = {RequestMethod.PUT, RequestMethod.PATCH})
  public Map<String, Object> updateSystem(@RequestBody Map<String, Object> body) {
    return settingsService.updateSystem(body);
  }

  @RequestMapping(method = {RequestMethod.PUT, RequestMethod.PATCH})
  public Map<String, Object> updateSettings(@RequestBody Map<String, Object> body) {
    if (body.containsKey("profile") && body.get("profile") instanceof Map<?, ?> p) {
      @SuppressWarnings("unchecked") Map<String, Object> pMap = (Map<String, Object>) p;
      settingsService.updateProfile(pMap);
    }
    if (body.containsKey("company") && body.get("company") instanceof Map<?, ?> c) {
      @SuppressWarnings("unchecked") Map<String, Object> cMap = (Map<String, Object>) c;
      settingsService.updateCompany(cMap);
    }
    if (body.containsKey("notifications") && body.get("notifications") instanceof Map<?, ?> n) {
      @SuppressWarnings("unchecked") Map<String, Object> nMap = (Map<String, Object>) n;
      settingsService.updateNotifications(nMap);
    }
    if (body.containsKey("appearance") && body.get("appearance") instanceof Map<?, ?> a) {
      @SuppressWarnings("unchecked") Map<String, Object> aMap = (Map<String, Object>) a;
      settingsService.updateAppearance(aMap);
    }
    if (body.containsKey("security") && body.get("security") instanceof Map<?, ?> s) {
      @SuppressWarnings("unchecked") Map<String, Object> sMap = (Map<String, Object>) s;
      settingsService.updateSecurity(sMap);
    }
    if (body.containsKey("system") && body.get("system") instanceof Map<?, ?> sys) {
      @SuppressWarnings("unchecked") Map<String, Object> sysMap = (Map<String, Object>) sys;
      settingsService.updateSystem(sysMap);
    }
    return settingsService.getSettings();
  }
}
