package com.app.usermanagement.security;

import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;

import java.util.Collection;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Component
public class KeycloakJwtAuthenticationConverter implements Converter<Jwt, AbstractAuthenticationToken> {

    private static final String REALM_ACCESS = "realm_access";
    private static final String ROLES = "roles";
    private static final String PREFERRED_USERNAME = "preferred_username";

    @Override
    public AbstractAuthenticationToken convert(Jwt jwt) {
        Collection<GrantedAuthority> authorities = extractAuthorities(jwt);
        String principalClaimValue = jwt.getClaimAsString(PREFERRED_USERNAME);
        if (principalClaimValue == null || principalClaimValue.isBlank()) {
            principalClaimValue = jwt.getSubject();
        }
        return new JwtAuthenticationToken(jwt, authorities, principalClaimValue);
    }

    @SuppressWarnings("unchecked")
    private Collection<GrantedAuthority> extractAuthorities(Jwt jwt) {
        Set<String> roles = new HashSet<>();

        // Extraction des rôles du Realm
        Map<String, Object> realmAccess = jwt.getClaim(REALM_ACCESS);
        if (realmAccess != null && realmAccess.containsKey(ROLES)) {
            Object rolesObj = realmAccess.get(ROLES);
            if (rolesObj instanceof List<?> list) {
                for (Object item : list) {
                    if (item instanceof String r) {
                        roles.add(r);
                    }
                }
            }
        }

        // Extraction des rôles de scope/ressource si présents
        Map<String, Object> resourceAccess = jwt.getClaim("resource_access");
        if (resourceAccess != null) {
            for (Object clientObj : resourceAccess.values()) {
                if (clientObj instanceof Map<?, ?> clientMap && clientMap.containsKey(ROLES)) {
                    Object clientRoles = clientMap.get(ROLES);
                    if (clientRoles instanceof List<?> list) {
                        for (Object item : list) {
                            if (item instanceof String r) {
                                roles.add(r);
                            }
                        }
                    }
                }
            }
        }

        if (roles.isEmpty()) {
            return Collections.emptyList();
        }

        return roles.stream()
                .map(role -> {
                    String cleanRole = role.toUpperCase();
                    // Assurer le préfixe ROLE_ pour Spring Security
                    if (!cleanRole.startsWith("ROLE_")) {
                        cleanRole = "ROLE_" + cleanRole;
                    }
                    return new SimpleGrantedAuthority(cleanRole);
                })
                .collect(Collectors.toSet());
    }
}
