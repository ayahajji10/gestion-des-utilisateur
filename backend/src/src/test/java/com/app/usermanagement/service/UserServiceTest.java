package com.app.usermanagement.service;

import com.app.usermanagement.dto.CreateUserRequest;
import com.app.usermanagement.dto.UpdateUserRequest;
import com.app.usermanagement.dto.UserDto;
import com.app.usermanagement.entity.UserEntity;
import com.app.usermanagement.entity.UserRole;
import com.app.usermanagement.entity.UserStatus;
import com.app.usermanagement.exception.BusinessException;
import com.app.usermanagement.exception.DuplicateResourceException;
import com.app.usermanagement.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private KeycloakAdminService keycloakAdminService;

    @InjectMocks
    private UserServiceImpl userService;

    private UserEntity sampleAdmin;

    @BeforeEach
    void setUp() {
        sampleAdmin = new UserEntity(
                1L,
                "kc-uuid-1",
                "s.benjelloun",
                "Benjelloun",
                "Sara",
                "s.benjelloun@exemple.ma",
                "06 98 76 54 32",
                UserStatus.ACTIF,
                UserRole.ADMINISTRATEUR
        );
    }

    @Test
    @DisplayName("Création d'un utilisateur valide : succès et synchronisation Keycloak")
    void testCreateUser_Success() {
        CreateUserRequest request = new CreateUserRequest(
                "k.alami", "Alami", "Karim", "k.alami@exemple.ma",
                "06 11 22 33 44", UserRole.LECTEUR, UserStatus.ACTIF
        );

        when(userRepository.existsByIdentifiantIgnoreCase("k.alami")).thenReturn(false);
        when(userRepository.existsByEmailIgnoreCase("k.alami@exemple.ma")).thenReturn(false);
        when(keycloakAdminService.createUser(eq("k.alami"), eq("Karim"), eq("Alami"), eq("k.alami@exemple.ma"), eq(UserRole.LECTEUR), eq(true)))
                .thenReturn("kc-new-uuid");

        UserEntity savedEntity = new UserEntity(
                2L, "kc-new-uuid", "k.alami", "Alami", "Karim",
                "k.alami@exemple.ma", "06 11 22 33 44", UserStatus.ACTIF, UserRole.LECTEUR
        );
        when(userRepository.save(any(UserEntity.class))).thenReturn(savedEntity);

        UserDto result = userService.createUser(request);

        assertNotNull(result);
        assertEquals("k.alami", result.getIdentifiant());
        assertEquals("kc-new-uuid", result.getKeycloakUserId());
        verify(keycloakAdminService).createUser(anyString(), anyString(), anyString(), anyString(), any(), anyBoolean());
        verify(userRepository).save(any(UserEntity.class));
    }

    @Test
    @DisplayName("Création avec identifiant déjà existant : levée d'un DuplicateResourceException")
    void testCreateUser_DuplicateIdentifiant() {
        CreateUserRequest request = new CreateUserRequest(
                "s.benjelloun", "Benjelloun", "Sara", "autre@exemple.ma",
                null, UserRole.LECTEUR, UserStatus.ACTIF
        );

        when(userRepository.existsByIdentifiantIgnoreCase("s.benjelloun")).thenReturn(true);

        assertThrows(DuplicateResourceException.class, () -> userService.createUser(request));
        verify(keycloakAdminService, never()).createUser(any(), any(), any(), any(), any(), anyBoolean());
    }

    @Test
    @DisplayName("Création avec email déjà existant : levée d'un DuplicateResourceException")
    void testCreateUser_DuplicateEmail() {
        CreateUserRequest request = new CreateUserRequest(
                "autre.id", "Nom", "Prenom", "s.benjelloun@exemple.ma",
                null, UserRole.LECTEUR, UserStatus.ACTIF
        );

        when(userRepository.existsByIdentifiantIgnoreCase("autre.id")).thenReturn(false);
        when(userRepository.existsByEmailIgnoreCase("s.benjelloun@exemple.ma")).thenReturn(true);

        assertThrows(DuplicateResourceException.class, () -> userService.createUser(request));
        verify(keycloakAdminService, never()).createUser(any(), any(), any(), any(), any(), anyBoolean());
    }

    @Test
    @DisplayName("Protection : interdiction de désactiver le dernier administrateur actif")
    void testDeactivateLastAdmin_ThrowsException() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(sampleAdmin));
        when(userRepository.countByRoleAndStatut(UserRole.ADMINISTRATEUR, UserStatus.ACTIF)).thenReturn(1L);

        BusinessException exception = assertThrows(BusinessException.class, () ->
                userService.updateUserStatus(1L, UserStatus.INACTIF)
        );

        assertTrue(exception.getMessage().contains("dernier administrateur actif"));
        verify(keycloakAdminService, never()).setUserEnabled(anyString(), anyBoolean());
    }

    @Test
    @DisplayName("Activation / désactivation d'un utilisateur régulier : succès")
    void testUpdateUserStatus_Success() {
        UserEntity regularUser = new UserEntity(
                5L, "kc-uuid-5", "o.berrada", "Berrada", "Omar",
                "o.berrada@exemple.ma", "06 22 33 44 55", UserStatus.INACTIF, UserRole.LECTEUR
        );

        when(userRepository.findById(5L)).thenReturn(Optional.of(regularUser));
        when(userRepository.save(any(UserEntity.class))).thenAnswer(i -> i.getArgument(0));

        UserDto result = userService.updateUserStatus(5L, UserStatus.ACTIF);

        assertNotNull(result);
        assertEquals(UserStatus.ACTIF, result.getStatut());
        verify(keycloakAdminService).setUserEnabled("kc-uuid-5", true);
    }
}
