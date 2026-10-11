package com.app.usermanagement.service;

import com.app.usermanagement.dto.CreateUserRequest;
import com.app.usermanagement.dto.PageResponse;
import com.app.usermanagement.dto.UpdateUserRequest;
import com.app.usermanagement.dto.UserDto;
import com.app.usermanagement.entity.UserStatus;
import org.springframework.data.domain.Pageable;

public interface UserService {

    PageResponse<UserDto> getUsers(String identifiant, String nomPrenom, String email, String statut, Pageable pageable);

    PageResponse<UserDto> getUsers(String identifiant, String nom, String prenom, String nomPrenom, String email, String statut, Pageable pageable);

    UserDto getUserById(Long id);

    UserDto createUser(CreateUserRequest request);

    UserDto updateUser(Long id, UpdateUserRequest request);

    UserDto updateUserStatus(Long id, UserStatus newStatus);

    UserDto getCurrentUser();
}
