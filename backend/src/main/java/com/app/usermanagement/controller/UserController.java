package com.app.usermanagement.controller;

import com.app.usermanagement.dto.CreateUserRequest;
import com.app.usermanagement.dto.PageResponse;
import com.app.usermanagement.dto.StatusUpdateRequest;
import com.app.usermanagement.dto.UpdateUserRequest;
import com.app.usermanagement.dto.UserDto;
import com.app.usermanagement.service.UserService;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    /**
     * Liste paginée des utilisateurs avec filtres combinés.
     * Accessible aux rôles ADMINISTRATEUR et LECTEUR.
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMINISTRATEUR', 'LECTEUR')")
    public ResponseEntity<PageResponse<UserDto>> getUsers(
            @RequestParam(required = false) String identifiant,
            @RequestParam(required = false) String nom,
            @RequestParam(required = false) String prenom,
            @RequestParam(required = false) String nomPrenom,
            @RequestParam(required = false) String email,
            @RequestParam(required = false) String statut,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir
    ) {
        Sort.Direction direction = "desc".equalsIgnoreCase(sortDir) ? Sort.Direction.DESC : Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));
        PageResponse<UserDto> response = userService.getUsers(identifiant, nom, prenom, nomPrenom, email, statut, pageable);
        return ResponseEntity.ok(response);
    }

    /**
     * Consultation des détails d'un utilisateur par son ID technique.
     * Accessible aux rôles ADMINISTRATEUR et LECTEUR.
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMINISTRATEUR', 'LECTEUR')")
    public ResponseEntity<UserDto> getUserById(@PathVariable Long id) {
        UserDto user = userService.getUserById(id);
        return ResponseEntity.ok(user);
    }

    /**
     * Profil de l'utilisateur actuellement authentifié.
     */
    @GetMapping("/me")
    @PreAuthorize("hasAnyRole('ADMINISTRATEUR', 'LECTEUR')")
    public ResponseEntity<UserDto> getCurrentUser() {
        UserDto currentUser = userService.getCurrentUser();
        return ResponseEntity.ok(currentUser);
    }

    /**
     * Création d'un nouvel utilisateur dans Keycloak et PostgreSQL.
     * Strictement réservé au rôle ADMINISTRATEUR.
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMINISTRATEUR')")
    public ResponseEntity<UserDto> createUser(@Valid @RequestBody CreateUserRequest request) {
        UserDto created = userService.createUser(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * Modification des informations d'un utilisateur existant.
     * Strictement réservé au rôle ADMINISTRATEUR.
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRATEUR')")
    public ResponseEntity<UserDto> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserRequest request
    ) {
        UserDto updated = userService.updateUser(id, request);
        return ResponseEntity.ok(updated);
    }

    /**
     * Activation ou désactivation du compte utilisateur.
     * Strictement réservé au rôle ADMINISTRATEUR.
     */
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMINISTRATEUR')")
    public ResponseEntity<UserDto> updateUserStatus(
            @PathVariable Long id,
            @Valid @RequestBody StatusUpdateRequest request
    ) {
        UserDto updated = userService.updateUserStatus(id, request.getStatut());
        return ResponseEntity.ok(updated);
    }
}
