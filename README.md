# Guide d'Exécution Complet — Gestion des Utilisateurs (Windows Natif Sans Docker)

Ce guide décrit pas à pas la configuration, l'initialisation et le démarrage de l'application de **Gestion des Utilisateurs** sur **Windows 11 / 10** en utilisant exclusivement des services natifs (**sans aucun conteneur Docker ni Docker Compose**).

---

## 📋 Prérequis et Outils Requis

| Composant | Rôle | Version recommandée |
| :--- | :--- | :--- |
| **Java Development Kit (JDK)** | Exécution de Spring Boot & Keycloak | OpenJDK 17 ou Java 21 |
| **Apache Maven** | Compilation et lancement du Backend | 3.8+ ou 3.9+ |
| **Node.js & npm** | Exécution et compilation d'Angular | Node.js v18+ ou v20+ / npm v10+ |
| **PostgreSQL** | Base de données relationnelle locale | PostgreSQL 15, 16 ou 18 |
| **Keycloak** | Serveur SSO OpenID Connect / OAuth 2.0 | Keycloak 24.0.5 Standalone (zip) |

---

## 🛠 Procédure Détaillée en 14 Étapes (PowerShell)

### Étape 1 : Vérifier l'installation de Java
Dans un terminal **PowerShell** :
```powershell
java -version
```
> Si la commande renvoie une version (ex. `17.0.x` ou `21.0.x`), Java est prêt. Si Java n'est pas reconnu, téléchargez et installez OpenJDK depuis [adoptium.net](https://adoptium.net).

---

### Étape 2 : Vérifier Node.js et npm
```powershell
node -v
npm -v
```
> Si Node.js n'est pas installé, téléchargez la version LTS sur [nodejs.org](https://nodejs.org).

---

### Étape 3 : Vérifier et démarrer le service PostgreSQL sur Windows
PostgreSQL fonctionne sous Windows en tant que service Windows natif.

1. **Vérifier l'état du service** :
   ```powershell
   Get-Service -Name "*postgres*"
   ```
2. **Démarrer le service si arrêté** :
   ```powershell
   Start-Service postgresql-x64-18
   ```
3. **Tester si le port PostgreSQL écoute** :
   ```powershell
   # Votre instance locale écoute sur le port 5433 (ou 5432)
   Test-NetConnection -ComputerName localhost -Port 5433
   ```

---

### Étape 4 : Installer Keycloak en Standalone sous Windows
1. Téléchargez l'archive zip officielle de **Keycloak 24.0.5** :
   👉 [https://github.com/keycloak/keycloak/releases/download/24.0.5/keycloak-24.0.5.zip](https://github.com/keycloak/keycloak/releases/download/24.0.5/keycloak-24.0.5.zip)
2. Décompressez l'archive à un emplacement de votre choix (par exemple `C:\keycloak-24.0.5` ou dans votre dossier utilisateur).
3. Assurez-vous que le fichier `kc.bat` est bien présent dans le sous-dossier `bin\` (`C:\keycloak-24.0.5\bin\kc.bat`).

---

### Étape 5 : Créer la base de données PostgreSQL et les tables
Exécutez le script autonome `db_setup.sql` situé à la racine du projet :

```powershell
cd "c:\Users\user\Desktop\Gestion des utilisateurs"

# 1. Créer la base de données si elle n'existe pas :
& "C:\Program Files\PostgreSQL\18\bin\createdb.exe" -h localhost -p 5433 -U postgres user_management_db

# 2. Exécuter le script SQL d'initialisation des tables et données de test :
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -h localhost -p 5433 -U postgres -d user_management_db -f db_setup.sql
```
*(Entrez le mot de passe de votre utilisateur `postgres` si demandé, par exemple `postgres`).*

> **Remarque :** Flyway est également activé dans le backend Spring Boot. Au démarrage du backend, il validera et appliquera automatiquement les migrations si nécessaire.

---

### Étape 6 : Préparer le Realm Keycloak
Le fichier de configuration du Realm `realm-export.json` est prêt à la racine du projet :
- Nom du Realm : **`user-management-realm`**
- Client SPA Frontend : **`user-management-frontend`** (Public, PKCE S256, redirection `http://localhost:4200/*`)
- Client Backend Admin : **`user-management-backend`** (Confidentiel, secret: `backend-secret-key-for-dev`)
- Rôles : **`ADMINISTRATEUR`** et **`LECTEUR`**

---

### Étape 7 : Vérifier les variables d'environnement
Le fichier `.env.example` à la racine récapitule les variables.
Si vos identifiants PostgreSQL sont standards (`port: 5433`, `user: postgres`, `password: postgres`), aucune modification n'est nécessaire.

---

### Étape 8 : Démarrer Keycloak (Terminal 1)
Ouvrez un premier terminal **PowerShell** dans le dossier du projet :

```powershell
cd "c:\Users\user\Desktop\Gestion des utilisateurs"
.\start-keycloak.ps1
```
*(Le script détecte automatiquement votre dossier Keycloak ou vous invite à saisir son chemin, puis lance le serveur avec import automatique du realm).*

Alternativement, lancement direct via la commande Keycloak :
```powershell
$env:KEYCLOAK_ADMIN="admin"
$env:KEYCLOAK_ADMIN_PASSWORD="admin"
C:\keycloak-24.0.5\bin\kc.bat start-dev --import-realm --dir="c:\Users\user\Desktop\Gestion des utilisateurs"
```
> Keycloak est accessible à l'adresse : [http://localhost:8080](http://localhost:8080)

---

### Étape 9 : Démarrer le Backend Spring Boot (Terminal 2)
Ouvrez un deuxième terminal **PowerShell** :

```powershell
cd "c:\Users\user\Desktop\Gestion des utilisateurs"
.\start-backend.ps1
```
*(Le script vérifie PostgreSQL et Keycloak, exporte les variables requises et lance `mvn spring-boot:run`).*

Alternativement, lancement manuel via Maven :
```powershell
cd "c:\Users\user\Desktop\Gestion des utilisateurs\backend"
$env:SPRING_DATASOURCE_URL="jdbc:postgresql://localhost:5433/user_management_db"
$env:SPRING_DATASOURCE_USERNAME="postgres"
$env:SPRING_DATASOURCE_PASSWORD="postgres"
mvn spring-boot:run
```
> Le backend est accessible sur : [http://localhost:8081](http://localhost:8081)
> Documentation Swagger : [http://localhost:8081/swagger-ui/index.html](http://localhost:8081/swagger-ui/index.html)

---

### Étape 10 : Démarrer le Frontend Angular (Terminal 3)
Ouvrez un troisième terminal **PowerShell** :

```powershell
cd "c:\Users\user\Desktop\Gestion des utilisateurs"
.\start-frontend.ps1
```
*(Le script vérifie les dépendances et démarre `npx ng serve --port 4200 --open`).*

Alternativement, lancement manuel :
```powershell
cd "c:\Users\user\Desktop\Gestion des utilisateurs\frontend"
npm start
```

---

### Étape 11 : Ouvrir l'application dans le navigateur
Ouvrez votre navigateur web sur :
👉 **[http://localhost:4200](http://localhost:4200)**

---

### Étape 12 : Comptes de test préconfigurés

| Utilisateur | Mot de passe | Rôle attribué | Permissions |
| :--- | :--- | :--- | :--- |
| **`s.benjelloun`** | `admin123` | **`ADMINISTRATEUR`** | Droits totaux : consultation, recherche, ajout d'utilisateur, modification, activation/désactivation, suppression. |
| **`y.amrani`** | `lecteur123` | **`LECTEUR`** | Droits de consultation uniquement : recherche, filtrage, pagination. Les boutons d'action (Ajouter, Modifier, Supprimer) sont masqués et protégés. |
| **`n.alami`** | `lecteur123` | **`LECTEUR`** | Consultation (profil actif). |
| **`o.berrada`** | `lecteur123` | **`LECTEUR`** | Consultation (profil inactif). |

---

### Étape 13 : Vérifier les droits du rôle ADMINISTRATEUR
1. Rendez-vous sur `http://localhost:4200`.
2. Connectez-vous avec l'utilisateur `s.benjelloun` / `admin123`.
3. Vous observez :
   - Le badge bleu **ADMINISTRATEUR** en haut à droite avec le nom de l'utilisateur.
   - Le bouton vert **"Nouvel utilisateur"** est visible et actif.
   - Les boutons d'action **Modifier**, **Activer / Désactiver** sont disponibles sur chaque ligne du tableau.
   - Créez un nouvel utilisateur pour tester l'enregistrement direct dans Keycloak et PostgreSQL.

---

### Étape 14 : Vérifier les droits du rôle LECTEUR
1. Cliquez sur **Déconnexion** dans la barre de navigation.
2. Reconnectez-vous avec l'utilisateur `y.amrani` / `lecteur123`.
3. Vous observez :
   - Le badge gris **LECTEUR** en haut à droite.
   - Le bouton "Nouvel utilisateur" est masqué.
   - Les actions de modification et de suppression ne sont pas proposées dans le tableau.
   - La recherche textuelle, le tri par colonne et les filtres fonctionnent parfaitement.
   - Si un utilisateur avec ce rôle tente d'appeler directement l'API REST `POST /api/users`, Spring Boot renvoie un statut **`403 Forbidden`**.
#   g e s t i o n - d e s - u t i l i s a t e u r  
 