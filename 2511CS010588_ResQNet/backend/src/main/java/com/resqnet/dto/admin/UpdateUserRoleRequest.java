package com.resqnet.dto.admin;

import com.resqnet.enums.Role;
import jakarta.validation.constraints.NotNull;

public class UpdateUserRoleRequest {

    @NotNull(message = "User role is required")
    private Role role;

    public UpdateUserRoleRequest() {
    }

    public UpdateUserRoleRequest(Role role) {
        this.role = role;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }
}
