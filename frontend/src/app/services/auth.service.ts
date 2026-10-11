import { Injectable } from '@angular/core';
import Keycloak from 'keycloak-js';
import { environment } from '../../environments/environment';
import { UserRole } from '../models/user.model';

export interface AuthUserProfile {
  username: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  roles: string[];
  activeRole: UserRole;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private keycloakInstance: Keycloak | null = null;
  private initialized = false;
  private authenticated = false;
  private profile: AuthUserProfile | null = null;

  // Mode secours/démo locale si Keycloak n'est pas joignable (ex: tests hors-ligne)
  private mockMode = false;

  constructor() {}

  async init(): Promise<boolean> {
    if (this.initialized) {
      return this.authenticated;
    }

    try {
      this.keycloakInstance = new Keycloak({
        url: environment.keycloak.url,
        realm: environment.keycloak.realm,
        clientId: environment.keycloak.clientId
      });

      const authenticated = await this.keycloakInstance.init({
        onLoad: 'check-sso',
        checkLoginIframe: false,
        pkceMethod: 'S256',
        silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html'
      });

      this.authenticated = authenticated;
      this.initialized = true;

      if (authenticated) {
        await this.loadUserProfile();
      }

      return authenticated;
    } catch (error) {
      console.warn('[AuthService] Impossible de contacter le serveur Keycloak. Mode autonome activé pour prévisualisation locale.', error);
      this.initialized = true;
      this.mockMode = true;

      // Par défaut, vérifie si une session démo est stockée
      const storedRole = localStorage.getItem('demo_role') as UserRole || 'ADMINISTRATEUR';
      this.setMockUser(storedRole);
      return true;
    }
  }

  private async loadUserProfile(): Promise<void> {
    if (!this.keycloakInstance) return;

    try {
      const parsedToken = this.keycloakInstance.tokenParsed as any;
      const roles: string[] = parsedToken?.realm_access?.roles || [];
      const isAdmin = roles.includes('ADMINISTRATEUR');

      this.profile = {
        username: parsedToken?.preferred_username || 'utilisateur',
        firstName: parsedToken?.given_name || '',
        lastName: parsedToken?.family_name || '',
        email: parsedToken?.email || '',
        roles: roles,
        activeRole: isAdmin ? 'ADMINISTRATEUR' : 'LECTEUR'
      };
    } catch (e) {
      console.error('[AuthService] Erreur lors du chargement du profil Keycloak:', e);
    }
  }

  async login(roleHint?: UserRole): Promise<void> {
    if (this.mockMode || !this.keycloakInstance) {
      this.setMockUser(roleHint || 'ADMINISTRATEUR');
      this.authenticated = true;
      return;
    }
    await this.keycloakInstance.login({
      redirectUri: window.location.origin + '/users'
    });
  }

  async logout(): Promise<void> {
    if (this.mockMode || !this.keycloakInstance) {
      localStorage.removeItem('demo_role');
      this.profile = null;
      this.authenticated = false;
      return;
    }
    await this.keycloakInstance.logout({
      redirectUri: window.location.origin + '/login'
    });
  }

  async getToken(): Promise<string | null> {
    if (this.mockMode) {
      // Token fictif de développement pour simuler les entêtes HTTP
      return 'mock-dev-token-' + (this.profile?.activeRole || 'ADMINISTRATEUR');
    }
    if (!this.keycloakInstance || !this.authenticated) {
      return null;
    }
    try {
      await this.keycloakInstance.updateToken(30);
      return this.keycloakInstance.token || null;
    } catch (e) {
      console.warn('[AuthService] Échec du rafraîchissement du jeton Keycloak:', e);
      return null;
    }
  }

  isAuthenticated(): boolean {
    return this.authenticated;
  }

  isAdmin(): boolean {
    if (this.profile) {
      return this.profile.activeRole === 'ADMINISTRATEUR' || this.profile.roles.includes('ADMINISTRATEUR');
    }
    return false;
  }

  isReader(): boolean {
    return !this.isAdmin();
  }

  getProfile(): AuthUserProfile | null {
    return this.profile;
  }

  getUsername(): string {
    return this.profile?.username || 'Anonyme';
  }

  getUserFullName(): string {
    if (this.profile && (this.profile.firstName || this.profile.lastName)) {
      return `${this.profile.firstName} ${this.profile.lastName}`.trim();
    }
    return this.getUsername();
  }

  // Permet de basculer facilement entre les rôles de test pour la validation technique
  setMockUser(role: UserRole): void {
    this.mockMode = true;
    this.authenticated = true;
    localStorage.setItem('demo_role', role);

    if (role === 'ADMINISTRATEUR') {
      this.profile = {
        username: 's.benjelloun',
        firstName: 'Sara',
        lastName: 'Benjelloun',
        email: 's.benjelloun@exemple.ma',
        roles: ['ADMINISTRATEUR'],
        activeRole: 'ADMINISTRATEUR'
      };
    } else {
      this.profile = {
        username: 'y.amrani',
        firstName: 'Youssef',
        lastName: 'El Amrani',
        email: 'y.amrani@exemple.ma',
        roles: ['LECTEUR'],
        activeRole: 'LECTEUR'
      };
    }
  }

  isMockMode(): boolean {
    return this.mockMode;
  }
}
