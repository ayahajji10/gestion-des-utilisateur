package com.app.usermanagement.service;

import com.app.usermanagement.dto.CreateUserRequest;
import com.app.usermanagement.dto.PageResponse;
import com.app.usermanagement.dto.UpdateUserRequest;
import com.app.usermanagement.dto.UserDto;
import com.app.usermanagement.entity.UserEntity;
import com.app.usermanagement.entity.UserRole;
import com.app.usermanagement.entity.UserStatus;
import com.app.usermanagement.exception.BusinessException;
import com.app.usermanagement.exception.DuplicateResourceException;
import com.app.usermanagement.exception.ResourceNotFoundException;
import com.app.usermanagement.repository.UserRepository;
import com.app.usermanagement.repository.UserSpecification;
import com.app.usermanagement.security.SecurityUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserServiceImpl implements UserService {

    private static final Logger log = LoggerFactory.getLogger(UserServiceImpl.class);

    private final UserRepository userRepository;
    private final KeycloakAdminService keycloakAdminService;

    public UserServiceImpl(UserRepository userRepository, KeycloakAdminService keycloakAdminService) {
        this.userRepository = userRepository;
        this.keycloakAdminService = keycloakAdminService;
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<UserDto> getUsers(String identifiant, String nomPrenom, String email, String statut, Pageable pageable) {
        return getUsers(identifiant, null, null, nomPrenom, email, statut, pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<UserDto> getUsers(String identifiant, String nom, String prenom, String nomPrenom, String email, String statut, Pageable pageable) {
        Specification<UserEntity> spec = UserSpecification.withFilters(identifiant, nom, prenom, nomPrenom, email, statut);
        Page<UserEntity> page = userRepository.findAll(spec, pageable);
        return PageResponse.of(page.map(UserDto::fromEntity));
    }

    @Override
    @Transactional(readOnly = true)
    public UserDto getUserById(Long id) {
        UserEntity entity = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable avec l'identifiant technique: " + id));
        return UserDto.fromEntity(entity);
    }

    @Override
    @Transactional
    public UserDto createUser(CreateUserRequest request) {
        String cleanIdentifiant = request.getIdentifiant().trim().toLowerCase();
        String cleanEmail = request.getEmail().trim().toLowerCase();

        // 1. Contrôle d'unicité en base de données
        if (userRepository.existsByIdentifiantIgnoreCase(cleanIdentifiant)) {
            throw new DuplicateResourceException("L'identifiant '" + request.getIdentifiant() + "' est déjà utilisé");
        }
        if (userRepository.existsByEmailIgnoreCase(cleanEmail)) {
            throw new DuplicateResourceException("L'adresse email '" + request.getEmail() + "' est déjà utilisée");
        }

        boolean isEnabled = request.getStatut() == UserStatus.ACTIF;

        // 2. Création du compte dans Keycloak (source de vérité pour l'authentification)
        String keycloakUserId = keycloakAdminService.createUser(
                cleanIdentifiant,
                request.getPrenom().trim(),
                request.getNom().trim(),
                cleanEmail,
                request.getRole(),
                isEnabled
        );

        // 3. Persistance dans PostgreSQL avec gestion de compensation si échec
        try {
            UserEntity entity = new UserEntity();
            entity.setKeycloakUserId(keycloakUserId);
            entity.setIdentifiant(cleanIdentifiant);
            entity.setNom(request.getNom().trim());
            entity.setPrenom(request.getPrenom().trim());
            entity.setEmail(cleanEmail);
            entity.setTelephone(request.getTelephone() != null ? request.getTelephone().trim() : null);
            entity.setStatut(request.getStatut());
            entity.setRole(request.getRole());

            UserEntity saved = userRepository.save(entity);
            log.info("Nouvel utilisateur créé avec succès: ID={}, Identifiant={}", saved.getId(), saved.getIdentifiant());
            return UserDto.fromEntity(saved);
        } catch (Exception ex) {
            log.error("Échec de persistance dans PostgreSQL, annulation de la création Keycloak pour {}", keycloakUserId, ex);
            // Rollback compensatoire dans Keycloak
            keycloakAdminService.deleteUser(keycloakUserId);
            throw new BusinessException("Échec de l'enregistrement de l'utilisateur: " + ex.getMessage());
        }
    }

    @Override
    @Transactional
    public UserDto updateUser(Long id, UpdateUserRequest request) {
        UserEntity entity = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable avec l'ID: " + id));

        String cleanEmail = request.getEmail().trim().toLowerCase();

        // Vérification de doublon d'email pour un autre utilisateur
        if (userRepository.existsByEmailIgnoreCaseAndIdNot(cleanEmail, id)) {
            throw new DuplicateResourceException("L'adresse email '" + request.getEmail() + "' est déjà utilisée par un autre compte");
        }

        // Règle de protection du dernier administrateur actif
        boolean isCurrentActiveAdmin = entity.getRole() == UserRole.ADMINISTRATEUR && entity.getStatut() == UserStatus.ACTIF;
        boolean willRemainActiveAdmin = request.getRole() == UserRole.ADMINISTRATEUR && request.getStatut() == UserStatus.ACTIF;

        if (isCurrentActiveAdmin && !willRemainActiveAdmin) {
            long activeAdminsCount = userRepository.countByRoleAndStatut(UserRole.ADMINISTRATEUR, UserStatus.ACTIF);
            if (activeAdminsCount <= 1) {
                throw new BusinessException("Impossible de rétrograder ou désactiver le dernier administrateur actif du système");
            }
        }

        // Mise à jour de l'entité PostgreSQL
        entity.setNom(request.getNom().trim());
        entity.setPrenom(request.getPrenom().trim());
        entity.setEmail(cleanEmail);
        entity.setTelephone(request.getTelephone() != null ? request.getTelephone().trim() : null);
        entity.setRole(request.getRole());
        entity.setStatut(request.getStatut());

        UserEntity updated = userRepository.save(entity);

        // Synchronisation avec Keycloak
        boolean isEnabled = request.getStatut() == UserStatus.ACTIF;
        keycloakAdminService.updateUser(
                entity.getKeycloakUserId(),
                request.getPrenom().trim(),
                request.getNom().trim(),
                cleanEmail,
                request.getRole(),
                isEnabled
        );

        log.info("Utilisateur mis à jour avec succès: ID={}, Identifiant={}", updated.getId(), updated.getIdentifiant());
        return UserDto.fromEntity(updated);
    }

    @Override
    @Transactional
    public UserDto updateUserStatus(Long id, UserStatus newStatus) {
        UserEntity entity = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable avec l'ID: " + id));

        if (entity.getStatut() == newStatus) {
            return UserDto.fromEntity(entity);
        }

        // Règle de sécurité : interdiction de désactiver le dernier administrateur actif
        if (entity.getRole() == UserRole.ADMINISTRATEUR && entity.getStatut() == UserStatus.ACTIF && newStatus == UserStatus.INACTIF) {
            long activeAdminsCount = userRepository.countByRoleAndStatut(UserRole.ADMINISTRATEUR, UserStatus.ACTIF);
            if (activeAdminsCount <= 1) {
                throw new BusinessException("Action refusée : impossible de désactiver le dernier administrateur actif de l'application");
            }
        }

        entity.setStatut(newStatus);
        UserEntity saved = userRepository.save(entity);

        // Synchronisation avec Keycloak (désactive le compte et déconnecte les sessions)
        boolean enabled = (newStatus == UserStatus.ACTIF);
        keycloakAdminService.setUserEnabled(entity.getKeycloakUserId(), enabled);

        log.info("Statut utilisateur modifié: ID={}, Nouveau statut={}", saved.getId(), newStatus);
        return UserDto.fromEntity(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public UserDto getCurrentUser() {
        String login = SecurityUtils.getCurrentUserLogin()
                .orElseThrow(() -> new BusinessException("Utilisateur non authentifié"));

        return userRepository.findByIdentifiantIgnoreCase(login)
                .or(() -> userRepository.findByEmailIgnoreCase(login))
                .or(() -> userRepository.findByKeycloakUserId(login))
                .map(UserDto::fromEntity)
                .orElseGet(() -> {
                    // Fallback profil minimal si l'utilisateur authentifié n'est pas encore dans PostgreSQL
                    UserDto fallback = new UserDto();
                    fallback.setIdentifiant(login);
                    fallback.setNom("Administrateur");
                    fallback.setPrenom("");
                    fallback.setEmail(login + "@local");
                    fallback.setRole(SecurityUtils.isCurrentUserAdmin() ? UserRole.ADMINISTRATEUR : UserRole.LECTEUR);
                    fallback.setStatut(UserStatus.ACTIF);
                    return fallback;
                });
    }
}
