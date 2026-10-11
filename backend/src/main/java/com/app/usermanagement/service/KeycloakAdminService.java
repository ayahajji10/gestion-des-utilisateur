package com.app.usermanagement.service;

import com.app.usermanagement.entity.UserRole;

public interface KeycloakAdminService {

    String createUser(String username, String firstName, String lastName, String email, UserRole role, boolean enabled);

    void updateUser(String keycloakUserId, String firstName, String lastName, String email, UserRole role, boolean enabled);

    void setUserEnabled(String keycloakUserId, boolean enabled);

    void deleteUser(String keycloakUserId);
}
