import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UserRole } from '../../models/user.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="login-wrapper">
      <div class="login-card">
        <div class="login-header">
          <div class="login-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            </svg>
          </div>
          <h1 class="login-title">Connexion Sécurisée</h1>
          <p class="login-desc">
            Authentification centralisée via OpenID Connect & Keycloak
          </p>
        </div>

        <div class="login-actions">
          <button class="btn-primary-sso" (click)="loginWithKeycloak()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
              <polyline points="10 17 15 12 10 7"></polyline>
              <line x1="15" y1="12" x2="3" y2="12"></line>
            </svg>
            <span>Se connecter avec Keycloak (SSO)</span>
          </button>
        </div>

        <div class="divider">
          <span>OU TEST RAPIDE SANS DOCKER</span>
        </div>

        <!-- Comptes de test préconfigurés pour le test technique -->
        <div class="test-accounts-section">
          <div class="section-title">Comptes de test prévus au cahier des charges :</div>

          <div class="account-card" (click)="quickLogin('ADMINISTRATEUR')">
            <div class="account-badge admin-badge">ADMINISTRATEUR</div>
            <div class="account-info">
              <strong>Sara Benjelloun</strong>
              <div class="account-details">
                <span>Identifiant: <code>s.benjelloun</code></span>
                <span>Mot de passe: <code>admin123</code></span>
              </div>
            </div>
            <button class="btn-quick-login">Tester en Admin →</button>
          </div>

          <div class="account-card" (click)="quickLogin('LECTEUR')">
            <div class="account-badge reader-badge">LECTEUR</div>
            <div class="account-info">
              <strong>Youssef El Amrani</strong>
              <div class="account-details">
                <span>Identifiant: <code>y.amrani</code></span>
                <span>Mot de passe: <code>lecteur123</code></span>
              </div>
            </div>
            <button class="btn-quick-login">Tester en Lecteur →</button>
          </div>
        </div>

        <div class="security-info">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
          <span>Flux OAuth 2.0 Authorization Code avec PKCE (S256). Aucun mot de passe n'est stocké côté client.</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-wrapper {
      min-height: calc(100vh - 72px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 32px 16px;
      background: radial-gradient(circle at 50% 20%, #1e293b 0%, #0f172a 100%);
    }
    .login-card {
      background: #ffffff;
      border-radius: 16px;
      width: 100%;
      max-width: 520px;
      padding: 40px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.35);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
    .login-header {
      text-align: center;
      margin-bottom: 28px;
    }
    .login-icon {
      width: 60px;
      height: 60px;
      margin: 0 auto 16px;
      background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      box-shadow: 0 10px 15px -3px rgba(37, 99, 235, 0.4);
    }
    .login-icon svg {
      width: 32px;
      height: 32px;
    }
    .login-title {
      font-size: 24px;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 8px;
    }
    .login-desc {
      font-size: 14px;
      color: #64748b;
      line-height: 1.5;
    }
    .login-actions {
      margin-bottom: 24px;
    }
    .btn-primary-sso {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      padding: 14px 20px;
      background: #2563eb;
      color: white;
      border: none;
      border-radius: 10px;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      box-shadow: 0 4px 14px rgba(37, 99, 235, 0.35);
      transition: all 0.2s;
    }
    .btn-primary-sso svg {
      width: 20px;
      height: 20px;
    }
    .btn-primary-sso:hover {
      background: #1d4ed8;
      transform: translateY(-1px);
    }
    .divider {
      display: flex;
      align-items: center;
      text-align: center;
      margin: 24px 0;
      color: #94a3b8;
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.5px;
    }
    .divider::before, .divider::after {
      content: '';
      flex: 1;
      border-bottom: 1px solid #e2e8f0;
    }
    .divider span {
      padding: 0 12px;
    }
    .test-accounts-section {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .section-title {
      font-size: 13px;
      font-weight: 600;
      color: #475569;
      margin-bottom: 4px;
    }
    .account-card {
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 12px 14px;
      display: flex;
      align-items: center;
      gap: 12px;
      cursor: pointer;
      background: #f8fafc;
      transition: all 0.2s ease;
    }
    .account-card:hover {
      background: #f1f5f9;
      border-color: #cbd5e1;
      transform: translateY(-1px);
    }
    .account-badge {
      font-size: 10px;
      font-weight: 700;
      padding: 3px 6px;
      border-radius: 4px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      width: fit-content;
    }
    .admin-badge {
      background: #d1fae5;
      color: #065f46;
    }
    .reader-badge {
      background: #dbeafe;
      color: #1e40af;
    }
    .account-info {
      flex: 1;
    }
    .account-info strong {
      font-size: 14px;
      color: #1e293b;
      display: block;
    }
    .account-details {
      display: flex;
      gap: 12px;
      font-size: 12px;
      color: #64748b;
      margin-top: 2px;
    }
    .account-details code {
      background: #e2e8f0;
      padding: 1px 4px;
      border-radius: 4px;
      color: #0f172a;
      font-family: monospace;
    }
    .btn-quick-login {
      background: white;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 600;
      color: #2563eb;
      padding: 6px 10px;
      cursor: pointer;
      white-space: nowrap;
      transition: all 0.15s;
    }
    .account-card:hover .btn-quick-login {
      background: #2563eb;
      color: white;
      border-color: #2563eb;
    }
    .security-info {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 28px;
      padding-top: 16px;
      border-top: 1px solid #f1f5f9;
      font-size: 12px;
      color: #64748b;
      line-height: 1.4;
    }
    .security-info svg {
      width: 18px;
      height: 18px;
      color: #3b82f6;
      flex-shrink: 0;
    }
  `]
})
export class LoginComponent implements OnInit {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/users']);
    }
  }

  async loginWithKeycloak(): Promise<void> {
    await this.authService.login();
  }

  quickLogin(role: UserRole): void {
    this.authService.setMockUser(role);
    this.router.navigate(['/users']);
  }
}
