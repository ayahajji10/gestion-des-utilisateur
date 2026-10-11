-- Script d'initialisation autonome de la base de données PostgreSQL
-- Application de Gestion des Utilisateurs (Exécution sous Windows sans Docker)

-- 1. Création de la base si elle n'existe pas (à exécuter dans postgres si nécessaire):
-- CREATE DATABASE user_management_db;

-- 2. Connexion à la base: \c user_management_db

-- 3. Création de la table des utilisateurs applicatifs
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

-- Index pour recherches rapides et contraintes d'unicité insensibles à la casse
CREATE UNIQUE INDEX IF NOT EXISTS uq_app_users_identifiant_lower ON app_users (LOWER(identifiant));
CREATE UNIQUE INDEX IF NOT EXISTS uq_app_users_email_lower ON app_users (LOWER(email));
CREATE INDEX IF NOT EXISTS idx_app_users_statut ON app_users (statut);
CREATE INDEX IF NOT EXISTS idx_app_users_nom ON app_users (LOWER(nom));
CREATE INDEX IF NOT EXISTS idx_app_users_prenom ON app_users (LOWER(prenom));

-- 4. Données initiales de démonstration conformes à Keycloak
INSERT INTO app_users (keycloak_user_id, identifiant, nom, prenom, email, telephone, statut, role, created_at, updated_at)
VALUES
    ('11111111-1111-1111-1111-111111111111', 's.benjelloun', 'Benjelloun', 'Sara', 's.benjelloun@exemple.ma', '06 98 76 54 32', 'ACTIF', 'ADMINISTRATEUR', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('22222222-2222-2222-2222-222222222222', 'y.amrani', 'El Amrani', 'Youssef', 'y.amrani@exemple.ma', '06 12 34 56 78', 'ACTIF', 'LECTEUR', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('33333333-3333-3333-3333-333333333333', 'o.berrada', 'Berrada', 'Omar', 'o.berrada@exemple.ma', '06 22 33 44 55', 'INACTIF', 'LECTEUR', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('44444444-4444-4444-4444-444444444444', 'n.alami', 'Alami', 'Nadia', 'n.alami@exemple.ma', '06 55 44 33 22', 'ACTIF', 'LECTEUR', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (identifiant) DO NOTHING;
