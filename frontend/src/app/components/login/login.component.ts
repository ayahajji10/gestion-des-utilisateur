import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { UserRole } from '../../models/user.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-page">
      <!-- Arrière-plan épuré avec maillage subtil -->
      <div class="background-decor" aria-hidden="true">
        <div class="glow-top"></div>
        <div class="grid-pattern"></div>
      </div>

      <!-- Carte de connexion centrée -->
      <div class="login-card">
        <!-- En-tête -->
        <header class="card-header">
          <div class="brand-logo">
            <svg viewBox="0 0 44 44" fill="none">
              <rect width="44" height="44" rx="12" fill="#002B49"/>
              <path d="M22 10L32 15V23C32 28.5 27.8 33.6 22 35C16.2 33.6 12 28.5 12 23V15L22 10Z" fill="#FFC72C"/>
              <path d="M19 23L21 25L25 21" stroke="#002B49" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <h1 class="card-title">Gestion des Utilisateurs</h1>
          <p class="card-subtitle">Connexion à votre espace</p>
        </header>

        <!-- Formulaire de connexion -->
        <form class="login-form" (ngSubmit)="handleLogin()">
          <!-- Champ Identifiant -->
          <div class="form-group">
            <label for="usernameInput" class="form-label">Identifiant</label>
            <div class="input-wrapper">
              <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              <input
                id="usernameInput"
                type="text"
                class="form-control"
                placeholder="Identifiant"
                [(ngModel)]="username"
                name="username"
                autocomplete="username"
                required
              />
            </div>
          </div>

          <!-- Champ Mot de passe -->
          <div class="form-group">
            <label for="passwordInput" class="form-label">Mot de passe</label>
            <div class="input-wrapper">
              <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <input
                id="passwordInput"
                [type]="showPassword ? 'text' : 'password'"
                class="form-control"
                placeholder="Mot de passe"
                [(ngModel)]="password"
                name="password"
                autocomplete="current-password"
                required
              />
              <button
                type="button"
                class="btn-toggle-pwd"
                (click)="showPassword = !showPassword"
                [title]="showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'"
                tabindex="-1"
              >
                <svg *ngIf="!showPassword" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
                <svg *ngIf="showPassword" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- Message d'erreur -->
          <div *ngIf="errorMessage" class="error-banner">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <span>{{ errorMessage }}</span>
          </div>

          <!-- Bouton Connexion -->
          <button
            type="submit"
            class="btn-submit"
            id="btn-submit"
            [disabled]="loading"
          >
            <span *ngIf="!loading">Se connecter &rarr;</span>
            <span *ngIf="loading" class="spinner"></span>
          </button>
        </form>
      </div>
    </div>
  `,
  styles: [`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

    :host {
      display: block;
      width: 100%;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    .login-page {
      min-height: 100vh;
      width: 100%;
      background: linear-gradient(145deg, #021B30 0%, #002B49 60%, #051A2E 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 32px 16px;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      position: relative;
      overflow: hidden;
    }

    /* Arrière-plan décoratif */
    .background-decor {
      position: absolute;
      inset: 0;
      pointer-events: none;
    }

    .glow-top {
      position: absolute;
      top: -120px;
      left: 50%;
      transform: translateX(-50%);
      width: 500px;
      height: 350px;
      background: radial-gradient(circle, rgba(255, 199, 44, 0.12) 0%, rgba(0, 43, 73, 0) 70%);
      filter: blur(60px);
    }

    .grid-pattern {
      position: absolute;
      inset: 0;
      background-image:
        linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
      background-size: 36px 36px;
    }

    /* Carte de connexion */
    .login-card {
      position: relative;
      z-index: 10;
      width: 100%;
      max-width: 440px;
      background: #FFFFFF;
      border-radius: 20px;
      padding: 40px 36px;
      box-shadow:
        0 20px 45px -12px rgba(0, 0, 0, 0.5),
        0 0 0 1px rgba(255, 255, 255, 0.1);
      animation: cardEnter 0.35s ease-out;
    }

    @keyframes cardEnter {
      from {
        opacity: 0;
        transform: translateY(14px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* En-tête */
    .card-header {
      text-align: center;
      margin-bottom: 28px;
    }

    .brand-logo {
      display: inline-flex;
      margin-bottom: 14px;
      filter: drop-shadow(0 4px 10px rgba(0, 43, 73, 0.2));
    }

    .brand-logo svg {
      width: 44px;
      height: 44px;
    }

    .card-title {
      font-size: 22px;
      font-weight: 800;
      color: #002B49;
      line-height: 1.25;
      letter-spacing: -0.4px;
      margin-bottom: 6px;
    }

    .card-subtitle {
      font-size: 13.5px;
      color: #64748B;
    }

    /* Formulaire */
    .login-form {
      display: flex;
      flex-direction: column;
      gap: 18px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .form-label {
      font-size: 13px;
      font-weight: 600;
      color: #1E293B;
    }

    .input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }

    .input-icon {
      position: absolute;
      left: 14px;
      width: 17px;
      height: 17px;
      color: #94A3B8;
      pointer-events: none;
    }

    .form-control {
      width: 100%;
      height: 46px;
      padding: 0 42px 0 40px;
      font-size: 14px;
      color: #0F172A;
      background: #F8FAFD;
      border: 1px solid #CBD5E1;
      border-radius: 10px;
      transition: all 0.2s ease;
      outline: none;
      font-family: inherit;
    }

    .form-control:focus {
      background: #FFFFFF;
      border-color: #002B49;
      box-shadow: 0 0 0 3px rgba(0, 43, 73, 0.12);
    }

    .form-control::placeholder {
      color: #94A3B8;
      font-size: 13px;
    }

    .btn-toggle-pwd {
      position: absolute;
      right: 12px;
      background: none;
      border: none;
      color: #94A3B8;
      cursor: pointer;
      padding: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .btn-toggle-pwd svg {
      width: 18px;
      height: 18px;
    }

    .btn-toggle-pwd:hover {
      color: #475569;
    }

    /* Erreur */
    .error-banner {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 14px;
      background: #FEF2F2;
      border: 1px solid #FCA5A5;
      border-radius: 8px;
      color: #B91C1C;
      font-size: 12.5px;
      font-weight: 500;
    }

    .error-banner svg {
      width: 16px;
      height: 16px;
      flex-shrink: 0;
    }

    /* Bouton Connexion */
    .btn-submit {
      width: 100%;
      height: 48px;
      margin-top: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      background: #FFC72C;
      color: #002B49;
      border: none;
      border-radius: 10px;
      font-size: 15px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s ease;
      box-shadow: 0 3px 10px rgba(255, 199, 44, 0.35);
    }

    .btn-submit:hover:not(:disabled) {
      background: #FFD24D;
      transform: translateY(-1px);
      box-shadow: 0 6px 16px rgba(255, 199, 44, 0.45);
    }

    .btn-submit:active:not(:disabled) {
      transform: translateY(0);
    }

    .btn-submit:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }

    .spinner {
      width: 18px;
      height: 18px;
      border: 2px solid #002B49;
      border-top-color: transparent;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }

    @media (max-width: 480px) {
      .login-card {
        padding: 30px 22px;
        border-radius: 16px;
      }
      .card-title {
        font-size: 20px;
      }
    }
  `]
})
export class LoginComponent implements OnInit {
  username = '';
  password = '';
  showPassword = false;
  errorMessage = '';
  loading = false;

  constructor(
    private authService: AuthService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/users']);
    }
  }

  handleLogin(): void {
    this.errorMessage = '';
    const u = (this.username || '').trim().toLowerCase();
    const p = (this.password || '').trim();

    if (!u) {
      this.errorMessage = 'Veuillez saisir votre identifiant.';
      return;
    }

    this.loading = true;

    // Simulation de chargement rapide pour un effet fluide
    setTimeout(() => {
      this.loading = false;

      // Administrateur (s.benjelloun ou admin)
      if (u === 's.benjelloun' || u === 'admin' || u === 'sara') {
        if (p && p !== 'admin123' && p !== 'admin') {
          this.errorMessage = 'Mot de passe incorrect pour le compte Administrateur (attendu: admin123).';
          return;
        }
        this.authService.setMockUser('ADMINISTRATEUR');
        this.notificationService.success('Connexion réussie en tant qu\'Administrateur.');
        this.router.navigate(['/users']);
        return;
      }

      // Lecteur (y.amrani, lecteur, etc.)
      if (u === 'y.amrani' || u === 'lecteur' || u === 'youssef' || u === 'n.alami' || u === 'o.berrada') {
        if (p && p !== 'lecteur123' && p !== 'lecteur') {
          this.errorMessage = 'Mot de passe incorrect pour le compte Lecteur (attendu: lecteur123).';
          return;
        }
        this.authService.setMockUser('LECTEUR');
        this.notificationService.success('Connexion réussie en tant que Lecteur.');
        this.router.navigate(['/users']);
        return;
      }

      // Tout autre utilisateur saisi est accepté par défaut en Lecteur pour flexibilité
      this.authService.setMockUser('LECTEUR');
      this.notificationService.success(`Connexion réussie pour ${this.username}.`);
      this.router.navigate(['/users']);
    }, 250);
  }
}
