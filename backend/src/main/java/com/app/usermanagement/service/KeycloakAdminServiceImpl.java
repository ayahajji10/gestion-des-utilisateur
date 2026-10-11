package com.app.usermanagement.service;

import com.app.usermanagement.entity.UserRole;
import com.app.usermanagement.exception.BusinessException;
import com.app.usermanagement.exception.DuplicateResourceException;
import jakarta.ws.rs.core.Response;
import org.keycloak.admin.client.Keycloak;
import org.keycloak.admin.client.resource.RealmResource;
import org.keycloak.admin.client.resource.UserResource;
import org.keycloak.admin.client.resource.UsersResource;
import org.keycloak.representations.idm.RoleRepresentation;
import org.keycloak.representations.idm.UserRepresentation;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;

@Service
public class KeycloakAdminServiceImpl implements KeycloakAdminService {

    private static final Logger log = LoggerFactory.getLogger(KeycloakAdminServiceImpl.class);

    private final Keycloak keycloak;

    @Value("${keycloak.realm:user-management-realm}")
    private String realm;

    public KeycloakAdminServiceImpl(Keycloak keycloak) {
        this.keycloak = keycloak;
    }

    private RealmResource getRealmResource() {
        return keycloak.realm(realm);
    }

    @Override
    public String createUser(String username, String firstName, String lastName, String email, UserRole role, boolean enabled) {
        try {
            UsersResource usersResource = getRealmResource().users();

            // Création de la représentation utilisateur
            UserRepresentation user = new UserRepresentation();
            user.setUsername(username);
            user.setFirstName(firstName);
            user.setLastName(lastName);
            user.setEmail(email);
            user.setEnabled(enabled);
            user.setEmailVerified(true);
            // Action requise pour forcer la définition du mot de passe lors de la première connexion
            user.setRequiredActions(Collections.singletonList("UPDATE_PASSWORD"));

            Response response = usersResource.create(user);
            int status = response.getStatus();

            if (status == 409) {
                log.warn("L'utilisateur ou l'email existe déjà dans Keycloak: {}", username);
                throw new DuplicateResourceException("Un utilisateur avec cet identifiant ou cet email existe déjà dans le système d'authentification");
            }

            if (status != 201) {
                String errorDetails = response.readEntity(String.class);
                log.error("Échec de la création de l'utilisateur dans Keycloak: statut={}, détails={}", status, errorDetails);
                throw new BusinessException("Impossible de créer le compte utilisateur dans le serveur d'authentification");
            }

            // Récupération de l'ID Keycloak généré
            String path = response.getLocation().getPath();
            String keycloakUserId = path.substring(path.lastIndexOf('/') + 1);
            log.info("Compte utilisateur créé avec succès dans Keycloak avec l'ID: {}", keycloakUserId);

            // Attribution du rôle Realm
            assignRealmRole(keycloakUserId, role);

            return keycloakUserId;
        } catch (DuplicateResourceException e) {
            throw e;
        } catch (Exception e) {
            log.error("Erreur lors de l'appel à l'API Keycloak Admin pour la création de l'utilisateur {}", username, e);
            throw new BusinessException("Erreur de synchronisation avec le serveur d'authentification: " + e.getMessage());
        }
    }

    @Override
    public void updateUser(String keycloakUserId, String firstName, String lastName, String email, UserRole role, boolean enabled) {
        try {
            UserResource userResource = getRealmResource().users().get(keycloakUserId);
            UserRepresentation user = userResource.toRepresentation();

            user.setFirstName(firstName);
            user.setLastName(lastName);
            user.setEmail(email);
            user.setEnabled(enabled);

            userResource.update(user);
            log.info("Informations Keycloak mises à jour pour l'utilisateur ID: {}", keycloakUserId);

            // Mise à jour des rôles
            assignRealmRole(keycloakUserId, role);

            // Si le compte est désactivé, invalider ses sessions actives
            if (!enabled) {
                userResource.logout();
                log.info("Sessions Keycloak invalidées pour l'utilisateur désactivé ID: {}", keycloakUserId);
            }
        } catch (Exception e) {
            log.error("Erreur lors de la mise à jour Keycloak pour l'utilisateur {}", keycloakUserId, e);
            throw new BusinessException("Erreur de mise à jour dans le serveur d'authentification: " + e.getMessage());
        }
    }

    @Override
    public void setUserEnabled(String keycloakUserId, boolean enabled) {
        try {
            UserResource userResource = getRealmResource().users().get(keycloakUserId);
            UserRepresentation user = userResource.toRepresentation();
            user.setEnabled(enabled);
            userResource.update(user);

            if (!enabled) {
                // Révocation immédiate des sessions actives
                userResource.logout();
                log.info("Utilisateur désactivé et sessions fermées dans Keycloak: {}", keycloakUserId);
            } else {
                log.info("Utilisateur réactivé avec succès dans Keycloak: {}", keycloakUserId);
            }
        } catch (Exception e) {
            log.error("Erreur lors du changement de statut dans Keycloak pour l'utilisateur {}", keycloakUserId, e);
            throw new BusinessException("Impossible de mettre à jour le statut dans le serveur d'authentification: " + e.getMessage());
        }
    }

    @Override
    public void deleteUser(String keycloakUserId) {
        try {
            getRealmResource().users().get(keycloakUserId).remove();
            log.info("Compte Keycloak supprimé (rollback) pour l'ID: {}", keycloakUserId);
        } catch (Exception e) {
            log.error("Échec du rollback de suppression Keycloak pour l'utilisateur {}", keycloakUserId, e);
        }
    }

    private void assignRealmRole(String keycloakUserId, UserRole role) {
        try {
            UserResource userResource = getRealmResource().users().get(keycloakUserId);

            // Retirer les anciens rôles applicatifs gérés
            List<RoleRepresentation> currentRoles = userResource.roles().realmLevel().listAll();
            for (RoleRepresentation r : currentRoles) {
                if ("ADMINISTRATEUR".equalsIgnoreCase(r.getName()) || "LECTEUR".equalsIgnoreCase(r.getName())) {
                    userResource.roles().realmLevel().remove(Collections.singletonList(r));
                }
            }

            // Attribuer le nouveau rôle
            RoleRepresentation targetRole = getRealmResource().roles().get(role.name()).toRepresentation();
            userResource.roles().realmLevel().add(Collections.singletonList(targetRole));
            log.info("Rôle Keycloak '{}' attribué à l'utilisateur {}", role.name(), keycloakUserId);
        } catch (Exception e) {
            log.warn("Impossible d'attribuer le rôle Keycloak {} à l'utilisateur {}: {}", role.name(), keycloakUserId, e.getMessage());
        }
    }
}
