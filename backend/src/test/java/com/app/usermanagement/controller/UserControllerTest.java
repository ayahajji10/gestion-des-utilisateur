package com.app.usermanagement.controller;

import com.app.usermanagement.config.SecurityConfig;
import com.app.usermanagement.dto.CreateUserRequest;
import com.app.usermanagement.dto.PageResponse;
import com.app.usermanagement.dto.UserDto;
import com.app.usermanagement.entity.UserRole;
import com.app.usermanagement.entity.UserStatus;
import com.app.usermanagement.security.KeycloakJwtAuthenticationConverter;
import com.app.usermanagement.service.UserService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(UserController.class)
@Import({SecurityConfig.class, KeycloakJwtAuthenticationConverter.class})
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private UserService userService;

    @Test
    @DisplayName("Requête non authentifiée : renvoie HTTP 401 Unauthorized")
    void testUnauthenticated_Returns401() throws Exception {
        mockMvc.perform(get("/api/users"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(roles = "LECTEUR")
    @DisplayName("Lecteur accède à la liste : renvoie HTTP 200 OK")
    void testReader_CanGetUsers_Returns200() throws Exception {
        PageResponse<UserDto> emptyPage = new PageResponse<>(Collections.emptyList(), 0, 10, 0, 0, true, true);
        when(userService.getUsers(any(), any(), any(), any(), any(), any(), any())).thenReturn(emptyPage);

        mockMvc.perform(get("/api/users"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "LECTEUR")
    @DisplayName("Lecteur tente de créer un utilisateur : renvoie HTTP 403 Forbidden")
    void testReader_CannotCreateUser_Returns403() throws Exception {
        CreateUserRequest request = new CreateUserRequest(
                "test.user", "Test", "User", "test@exemple.ma",
                "06 00 00 00 00", UserRole.LECTEUR, UserStatus.ACTIF
        );

        mockMvc.perform(post("/api/users")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "ADMINISTRATEUR")
    @DisplayName("Administrateur crée un utilisateur valide : renvoie HTTP 201 Created")
    void testAdmin_CreateUser_Returns201() throws Exception {
        CreateUserRequest request = new CreateUserRequest(
                "new.admin", "Dupont", "Jean", "jean.dupont@exemple.ma",
                "06 12 34 56 78", UserRole.ADMINISTRATEUR, UserStatus.ACTIF
        );

        UserDto createdDto = new UserDto();
        createdDto.setId(10L);
        createdDto.setIdentifiant("new.admin");
        createdDto.setEmail("jean.dupont@exemple.ma");

        when(userService.createUser(any(CreateUserRequest.class))).thenReturn(createdDto);

        mockMvc.perform(post("/api/users")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.identifiant").value("new.admin"));
    }

    @Test
    @WithMockUser(roles = "ADMINISTRATEUR")
    @DisplayName("Validation échouée (champs manquants) : renvoie HTTP 400 Bad Request")
    void testAdmin_InvalidBody_Returns400() throws Exception {
        // Corps incomplet sans nom ni email
        CreateUserRequest invalidRequest = new CreateUserRequest();
        invalidRequest.setIdentifiant("invalid");

        mockMvc.perform(post("/api/users")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.validationErrors").exists());
    }
}
