package com.resqnet.service;

import com.resqnet.dto.auth.AuthResponse;
import com.resqnet.dto.auth.LoginRequest;
import com.resqnet.dto.auth.RegisterRequest;
import com.resqnet.dto.auth.UserProfileResponse;

public interface AuthService {
    AuthResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
    UserProfileResponse getCurrentUserProfile(String email);
}
