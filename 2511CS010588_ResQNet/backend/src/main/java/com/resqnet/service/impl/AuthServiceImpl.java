package com.resqnet.service.impl;

import com.resqnet.dto.auth.AuthResponse;
import com.resqnet.dto.auth.LoginRequest;
import com.resqnet.dto.auth.RegisterRequest;
import com.resqnet.dto.auth.UserProfileResponse;
import com.resqnet.entity.CitizenProfile;
import com.resqnet.entity.RescueTeamProfile;
import com.resqnet.entity.User;
import com.resqnet.entity.VolunteerProfile;
import com.resqnet.enums.Role;
import com.resqnet.exception.BadRequestException;
import com.resqnet.exception.ResourceNotFoundException;
import com.resqnet.repository.CitizenProfileRepository;
import com.resqnet.repository.RescueTeamProfileRepository;
import com.resqnet.repository.UserRepository;
import com.resqnet.repository.VolunteerProfileRepository;
import com.resqnet.security.JwtUtils;
import com.resqnet.service.AuthService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final CitizenProfileRepository citizenProfileRepository;
    private final VolunteerProfileRepository volunteerProfileRepository;
    private final RescueTeamProfileRepository rescueTeamProfileRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;

    public AuthServiceImpl(UserRepository userRepository,
                           CitizenProfileRepository citizenProfileRepository,
                           VolunteerProfileRepository volunteerProfileRepository,
                           RescueTeamProfileRepository rescueTeamProfileRepository,
                           PasswordEncoder passwordEncoder,
                           AuthenticationManager authenticationManager,
                           JwtUtils jwtUtils) {
        this.userRepository = userRepository;
        this.citizenProfileRepository = citizenProfileRepository;
        this.volunteerProfileRepository = volunteerProfileRepository;
        this.rescueTeamProfileRepository = rescueTeamProfileRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtUtils = jwtUtils;
    }

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email is already registered: " + request.getEmail());
        }

        User user = new User();
        user.setEmail(request.getEmail().toLowerCase().trim());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFullName(request.getFullName().trim());
        user.setPhone(request.getPhone());
        user.setRole(request.getRole());
        user.setBloodGroup(request.getBloodGroup());
        user.setEmergencyContactName(request.getEmergencyContactName());
        user.setEmergencyContactPhone(request.getEmergencyContactPhone());
        user.setAddress(request.getAddress());
        user.setCurrentLatitude(request.getCurrentLatitude());
        user.setCurrentLongitude(request.getCurrentLongitude());
        user.setIsActive(true);

        // Attach role-specific sub-profiles
        Object profileData = null;
        if (request.getRole() == Role.CITIZEN) {
            CitizenProfile profile = new CitizenProfile(user);
            profile.setMedicalConditions(request.getMedicalConditions());
            profile.setAllergies(request.getAllergies());
            profile.setSpecialNeeds(request.getSpecialNeeds());
            profile.setIsElderlyOrChild(request.getIsElderlyOrChild() != null ? request.getIsElderlyOrChild() : false);
            user.setCitizenProfile(profile);
            profileData = profile;
        } else if (request.getRole() == Role.VOLUNTEER) {
            VolunteerProfile profile = new VolunteerProfile(user);
            profile.setSkills(request.getSkills());
            if (request.getAvailabilityStatus() != null) {
                profile.setAvailabilityStatus(request.getAvailabilityStatus());
            }
            if (request.getPreferredRadiusKm() != null) {
                profile.setPreferredRadiusKm(request.getPreferredRadiusKm());
            }
            user.setVolunteerProfile(profile);
            profileData = profile;
        } else if (request.getRole() == Role.RESCUE_TEAM) {
            RescueTeamProfile profile = new RescueTeamProfile(user);
            profile.setUnitName(request.getUnitName() != null ? request.getUnitName() : request.getFullName());
            profile.setCallSign(request.getCallSign());
            if (request.getTeamType() != null) {
                profile.setTeamType(request.getTeamType());
            }
            if (request.getMemberCount() != null) {
                profile.setMemberCount(request.getMemberCount());
            }
            profile.setVehicleType(request.getVehicleType());
            profile.setEquipmentList(request.getEquipmentList());
            user.setRescueTeamProfile(profile);
            profileData = profile;
        }

        User savedUser = userRepository.save(user);

        // Generate token
        String token = jwtUtils.generateTokenFromEmail(savedUser.getEmail(), savedUser.getRole().name());

        return new AuthResponse(
                token,
                savedUser.getId(),
                savedUser.getEmail(),
                savedUser.getFullName(),
                savedUser.getRole(),
                profileData
        );
    }

    @Override
    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail().toLowerCase().trim(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        User user = userRepository.findByEmail(request.getEmail().toLowerCase().trim())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + request.getEmail()));

        Object profileData = getRoleProfileData(user);

        return new AuthResponse(
                jwt,
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getRole(),
                profileData
        );
    }

    @Override
    @Transactional(readOnly = true)
    public UserProfileResponse getCurrentUserProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        UserProfileResponse response = new UserProfileResponse();
        response.setId(user.getId());
        response.setEmail(user.getEmail());
        response.setFullName(user.getFullName());
        response.setPhone(user.getPhone());
        response.setRole(user.getRole());
        response.setBloodGroup(user.getBloodGroup());
        response.setEmergencyContactName(user.getEmergencyContactName());
        response.setEmergencyContactPhone(user.getEmergencyContactPhone());
        response.setCurrentLatitude(user.getCurrentLatitude());
        response.setCurrentLongitude(user.getCurrentLongitude());
        response.setAddress(user.getAddress());
        response.setIsActive(user.getIsActive());
        response.setCreatedAt(user.getCreatedAt());
        response.setRoleProfile(getRoleProfileData(user));

        return response;
    }

    private Object getRoleProfileData(User user) {
        if (user.getRole() == Role.CITIZEN) {
            return citizenProfileRepository.findByUserId(user.getId()).orElse(null);
        } else if (user.getRole() == Role.VOLUNTEER) {
            return volunteerProfileRepository.findByUserId(user.getId()).orElse(null);
        } else if (user.getRole() == Role.RESCUE_TEAM) {
            return rescueTeamProfileRepository.findByUserId(user.getId()).orElse(null);
        }
        return null;
    }
}
