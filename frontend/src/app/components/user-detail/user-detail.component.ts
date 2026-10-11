import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="page-container" *ngIf="user">
      <!-- Fil d'Ariane -->
      <div class="breadcrumb">
        <svg class="home-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
        <span class="breadcrumb-separator">&gt;</span>
        <span class="breadcrumb-current">Gestion des utilisateurs</span>
      </div>

      <div class="detail-wrapper">
        <!-- En-tête -->
        <div class="detail-header">
          <div>
            <h1 class="page-title">{{ user.prenom }} {{ user.nom }}</h1>
            <p class="page-subtitle">Consultation des informations du compte utilisateur</p>
          </div>

          <div class="header-actions">
            <button class="btn-cancel" routerLink="/users">
              Retour
            </button>
            <button *ngIf="authService.isAdmin()" class="btn-save" [routerLink]="['/users', user.id, 'edit']">
              Modifier l'utilisateur
            </button>
          </div>
        </div>


        <!-- Profil Card -->
        <div class="profile-hero-card">
          <div class="hero-avatar">
            {{ getInitials(user) }}
          </div>
          <div class="hero-info">
            <div class="hero-name-row">
              <h1 class="hero-name">{{ user.prenom }} {{ user.nom }}</h1>
              <span
                class="badge-status"
                [ngClass]="user.statut === 'ACTIF' ? 'status-active' : 'status-inactive'"
              >
                <span class="status-dot"></span>
                {{ user.statut }}
              </span>
            </div>
            <div class="hero-meta">
              <span class="meta-identifiant"><code>{{ user.identifiant }}</code></span>
              <span class="meta-sep">•</span>
              <span
                class="badge-role"
                [ngClass]="user.role === 'ADMINISTRATEUR' ? 'badge-admin' : 'badge-reader'"
              >
                {{ user.role }}
              </span>
            </div>
          </div>
        </div>

        <!-- Grille de Détails -->
        <div class="details-grid">
          <!-- Carte Informations de Contact -->
          <div class="info-card">
            <h3 class="card-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
              Coordonnées
            </h3>
            <div class="property-list">
              <div class="property-item">
                <span class="property-label">Adresse Email</span>
                <span class="property-value">{{ user.email }}</span>
              </div>
              <div class="property-item">
                <span class="property-label">Téléphone</span>
                <span class="property-value">{{ user.telephone || 'Non renseigné' }}</span>
              </div>
            </div>
          </div>

          <!-- Carte Sécurité & Authentification -->
          <div class="info-card">
            <h3 class="card-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              Sécurité & Keycloak
            </h3>
            <div class="property-list">
              <div class="property-item">
                <span class="property-label">Rôle Keycloak (Realm)</span>
                <span class="property-value"><strong>{{ user.role }}</strong></span>
              </div>
              <div class="property-item">
                <span class="property-label">Identifiant Keycloak (UUID)</span>
                <span class="property-value code-value">{{ user.keycloakUserId }}</span>
              </div>
            </div>
          </div>

          <!-- Carte Traçabilité & Audit -->
          <div class="info-card full-width">
            <h3 class="card-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              Traçabilité Système
            </h3>
            <div class="audit-grid">
              <div class="property-item">
                <span class="property-label">ID Technique PostgreSQL</span>
                <span class="property-value">#{{ user.id }}</span>
              </div>
              <div class="property-item">
                <span class="property-label">Date de création</span>
                <span class="property-value">{{ formatDate(user.createdAt) }}</span>
              </div>
              <div class="property-item">
                <span class="property-label">Dernière mise à jour</span>
                <span class="property-value">{{ formatDate(user.updatedAt) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- État Chargement -->
    <div class="page-container text-center" *ngIf="loading">
      <div class="spinner-large"></div>
      <p class="mt-3">Chargement des détails de l'utilisateur...</p>
    </div>
  `,
  styles: [`
    .page-container {
      max-width: 1000px;
      margin: 0 auto;
      padding: 32px 24px;
    }
    .detail-wrapper {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }
    .detail-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .btn-back {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 14px;
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 600;
      color: #475569;
      cursor: pointer;
      text-decoration: none;
      transition: all 0.15s;
    }
    .btn-back svg {
      width: 16px;
      height: 16px;
    }
    .btn-back:hover {
      background: #f1f5f9;
      color: #0f172a;
    }
    .btn-primary {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 9px 18px;
      background: #2563eb;
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      text-decoration: none;
      transition: background 0.2s;
    }
    .btn-primary svg {
      width: 16px;
      height: 16px;
    }
    .btn-primary:hover {
      background: #1d4ed8;
    }
    .profile-hero-card {
      background: #ffffff;
      border-radius: 14px;
      padding: 28px 32px;
      border: 1px solid #e2e8f0;
      display: flex;
      align-items: center;
      gap: 24px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    }
    .hero-avatar {
      width: 68px;
      height: 68px;
      border-radius: 50%;
      background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
      color: white;
      font-weight: 700;
      font-size: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
      flex-shrink: 0;
    }
    .hero-info {
      flex: 1;
    }
    .hero-name-row {
      display: flex;
      align-items: center;
      gap: 14px;
      flex-wrap: wrap;
    }
    .hero-name {
      font-size: 24px;
      font-weight: 700;
      color: #0f172a;
      margin: 0;
    }
    .hero-meta {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-top: 6px;
    }
    .meta-identifiant code {
      background: #f1f5f9;
      padding: 2px 8px;
      border-radius: 6px;
      font-size: 13px;
      color: #334155;
    }
    .meta-sep {
      color: #cbd5e1;
    }
    .badge-role {
      font-size: 11px;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 6px;
      text-transform: uppercase;
      letter-spacing: 0.4px;
    }
    .badge-admin {
      background: #ede9fe;
      color: #6d28d9;
      border: 1px solid #ddd6fe;
    }
    .badge-reader {
      background: #e0f2fe;
      color: #0369a1;
      border: 1px solid #bae6fd;
    }
    .badge-status {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 11px;
      font-weight: 700;
      padding: 3px 10px;
      border-radius: 12px;
    }
    .status-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
    }
    .status-active {
      background: #dcfce7;
      color: #15803d;
    }
    .status-active .status-dot {
      background: #16a34a;
    }
    .status-inactive {
      background: #fee2e2;
      color: #b91c1c;
    }
    .status-inactive .status-dot {
      background: #dc2626;
    }
    .details-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
    }
    .full-width {
      grid-column: span 2;
    }
    .info-card {
      background: #ffffff;
      border-radius: 12px;
      border: 1px solid #e2e8f0;
      padding: 24px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    }
    .card-title {
      font-size: 15px;
      font-weight: 700;
      color: #1e293b;
      margin: 0 0 16px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .card-title svg {
      width: 18px;
      height: 18px;
      color: #3b82f6;
    }
    .property-list {
      display: flex;
      flex-direction: column;
      gap: 14px;
    }
    .audit-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
    }
    .property-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .property-label {
      font-size: 12px;
      font-weight: 600;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .property-value {
      font-size: 14px;
      color: #0f172a;
    }
    .code-value {
      font-family: monospace;
      font-size: 12px;
      color: #475569;
      background: #f8fafc;
      padding: 3px 6px;
      border-radius: 4px;
      word-break: break-all;
    }
    .spinner-large {
      width: 40px;
      height: 40px;
      border: 3px solid #e2e8f0;
      border-top-color: #2563eb;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin: 60px auto 16px;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    @media (max-width: 640px) {
      .details-grid {
        grid-template-columns: 1fr;
      }
      .full-width {
        grid-column: span 1;
      }
      .audit-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class UserDetailComponent implements OnInit {
  user: User | null = null;
  loading = false;

  constructor(
    private userService: UserService,
    public authService: AuthService,
    private notificationService: NotificationService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.loadUser(Number(idParam));
    }
  }

  loadUser(id: number): void {
    this.loading = true;
    this.userService.getUserById(id).subscribe({
      next: u => {
        this.user = u;
        this.loading = false;
      },
      error: err => {
        this.loading = false;
        this.notificationService.error('Impossible de charger les informations de cet utilisateur.');
        this.router.navigate(['/users']);
      }
    });
  }

  getInitials(u: User): string {
    return `${u.prenom[0] || ''}${u.nom[0] || ''}`.toUpperCase();
  }

  formatDate(dateStr?: string): string {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  }
}
