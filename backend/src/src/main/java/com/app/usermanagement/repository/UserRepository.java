package com.app.usermanagement.repository;

import com.app.usermanagement.entity.UserEntity;
import com.app.usermanagement.entity.UserRole;
import com.app.usermanagement.entity.UserStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<UserEntity, Long>, JpaSpecificationExecutor<UserEntity> {

    Optional<UserEntity> findByIdentifiantIgnoreCase(String identifiant);

    Optional<UserEntity> findByEmailIgnoreCase(String email);

    Optional<UserEntity> findByKeycloakUserId(String keycloakUserId);

    boolean existsByIdentifiantIgnoreCase(String identifiant);

    boolean existsByEmailIgnoreCase(String email);

    boolean existsByIdentifiantIgnoreCaseAndIdNot(String identifiant, Long id);

    boolean existsByEmailIgnoreCaseAndIdNot(String email, Long id);

    long countByRoleAndStatut(UserRole role, UserStatus statut);
}
