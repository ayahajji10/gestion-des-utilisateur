-- Migration V1: Création de la table des utilisateurs applicatifs
CREATE TABLE IF NOT EXISTS app_users (
    id BIGSERIAL PRIMARY KEY,
    keycloak_user_id VARCHAR(64) NOT NULL UNIQUE,
    identifiant VARCHAR(50) NOT NULL UNIQUE,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    telephone VARCHAR(30),
    statut VARCHAR(20) NOT NULL DEFAULT 'ACTIF',
    role VARCHAR(30) NOT NULL DEFAULT 'LECTEUR',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_app_users_statut CHECK (statut IN ('ACTIF', 'INACTIF')),
    CONSTRAINT chk_app_users_role CHECK (role IN ('ADMINISTRATEUR', 'LECTEUR'))
);

-- Index pour les recherches insensibles à la casse et les filtres de performance
CREATE UNIQUE INDEX IF NOT EXISTS uq_app_users_identifiant_lower ON app_users (LOWER(identifiant));
CREATE UNIQUE INDEX IF NOT EXISTS uq_app_users_email_lower ON app_users (LOWER(email));
CREATE INDEX IF NOT EXISTS idx_app_users_statut ON app_users (statut);
CREATE INDEX IF NOT EXISTS idx_app_users_nom ON app_users (LOWER(nom));
CREATE INDEX IF NOT EXISTS idx_app_users_prenom ON app_users (LOWER(prenom));
