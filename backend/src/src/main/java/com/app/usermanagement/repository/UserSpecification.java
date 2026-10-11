package com.app.usermanagement.repository;

import com.app.usermanagement.entity.UserEntity;
import com.app.usermanagement.entity.UserStatus;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;

public class UserSpecification {

    private UserSpecification() {
    }

    public static Specification<UserEntity> withFilters(String identifiant, String nom, String prenom, String nomPrenom, String email, String statut) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (StringUtils.hasText(identifiant)) {
                predicates.add(cb.like(cb.lower(root.get("identifiant")), "%" + identifiant.trim().toLowerCase() + "%"));
            }

            if (StringUtils.hasText(nom)) {
                predicates.add(cb.like(cb.lower(root.get("nom")), "%" + nom.trim().toLowerCase() + "%"));
            }

            if (StringUtils.hasText(prenom)) {
                predicates.add(cb.like(cb.lower(root.get("prenom")), "%" + prenom.trim().toLowerCase() + "%"));
            }

            if (!StringUtils.hasText(nom) && !StringUtils.hasText(prenom) && StringUtils.hasText(nomPrenom)) {
                String term = "%" + nomPrenom.trim().toLowerCase() + "%";
                Predicate nomPredicate = cb.like(cb.lower(root.get("nom")), term);
                Predicate prenomPredicate = cb.like(cb.lower(root.get("prenom")), term);
                predicates.add(cb.or(nomPredicate, prenomPredicate));
            }

            if (StringUtils.hasText(email)) {
                predicates.add(cb.like(cb.lower(root.get("email")), "%" + email.trim().toLowerCase() + "%"));
            }

            if (StringUtils.hasText(statut) && !"TOUS".equalsIgnoreCase(statut.trim())) {
                try {
                    UserStatus userStatus = UserStatus.valueOf(statut.trim().toUpperCase());
                    predicates.add(cb.equal(root.get("statut"), userStatus));
                } catch (IllegalArgumentException ignored) {
                    // Si la valeur reçue n'est pas reconnue, on ne filtre pas sur le statut
                }
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    public static Specification<UserEntity> withFilters(String identifiant, String nomPrenom, String email, String statut) {
        return withFilters(identifiant, null, null, nomPrenom, email, statut);
    }
}
