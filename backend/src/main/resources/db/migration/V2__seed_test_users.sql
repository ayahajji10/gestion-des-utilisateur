-- Migration V2: Données initiales de test conformes aux maquettes
INSERT INTO app_users (keycloak_user_id, identifiant, nom, prenom, email, telephone, statut, role, created_at, updated_at)
VALUES
    ('22222222-2222-2222-2222-222222222222', 'y.amrani', 'El Amrani', 'Youssef', 'y.amrani@exemple.ma', '06 12 34 56 78', 'ACTIF', 'LECTEUR', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('11111111-1111-1111-1111-111111111111', 's.benjelloun', 'Benjelloun', 'Sara', 's.benjelloun@exemple.ma', '06 98 76 54 32', 'ACTIF', 'ADMINISTRATEUR', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('33333333-3333-3333-3333-333333333333', 'o.berrada', 'Berrada', 'Omar', 'o.berrada@exemple.ma', '06 22 33 44 55', 'INACTIF', 'LECTEUR', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('44444444-4444-4444-4444-444444444444', 'n.alami', 'Alami', 'Nadia', 'n.alami@exemple.ma', '06 55 44 33 22', 'ACTIF', 'LECTEUR', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (identifiant) DO NOTHING;
