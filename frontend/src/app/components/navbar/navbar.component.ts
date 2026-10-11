import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UserRole } from '../../models/user.model';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <aside class="sidebar" *ngIf="authService.isAuthenticated()">
      <div class="sidebar-top">
        <nav class="sidebar-nav">
          <!-- Tableau de bord -->
          <a class="nav-item" routerLink="/users" [class.active]="false" title="Tableau de bord">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
            <span class="nav-label">Tableau de bord</span>
          </a>

          <!-- Utilisateurs (Actif dans la maquette) -->
          <a class="nav-item active" routerLink="/users" title="Gestion des utilisateurs">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
            <span class="nav-label">Utilisateurs</span>
          </a>
        </nav>
      </div>

      <!-- Bas de sidebar : Profil utilisateur & Menu -->
      <div class="sidebar-bottom">
        <!-- Bouton / Carte Profil -->
        <div class="profile-card" (click)="toggleProfileMenu()" [class.menu-open]="showProfileMenu">
          <div class="profile-avatar">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
          </div>
          <div class="profile-info">
            <span class="profile-name">{{ getDisplayName() }}</span>
            <span class="profile-role">{{ authService.isAdmin() ? 'ADMINISTRATEUR' : 'LECTEUR' }}</span>
          </div>
          <svg class="chevron-icon" [class.rotated]="showProfileMenu" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>

        <!-- Menu déroulant du profil -->
        <div class="profile-dropdown" *ngIf="showProfileMenu">
          <div class="dropdown-header">
            <strong>{{ authService.getUserFullName() }}</strong>
            <span class="dropdown-role">{{ authService.isAdmin() ? 'Rôle : Administrateur' : 'Rôle : Lecteur' }}</span>
          </div>

          <!-- Bascule de rôle pour la démonstration -->
          <div class="dropdown-section">
            <span class="section-title">Mode test rôle (Démonstration) :</span>
            <div class="role-switcher-buttons">
              <button
                type="button"
                class="role-btn"
                [class.active]="authService.isAdmin()"
                (click)="switchRole('ADMINISTRATEUR')"
              >
                Admin
              </button>
              <button
                type="button"
                class="role-btn"
                [class.active]="!authService.isAdmin()"
                (click)="switchRole('LECTEUR')"
              >
                Lecteur
              </button>
            </div>
          </div>

          <div class="dropdown-divider"></div>

          <button class="dropdown-logout-btn" (click)="onLogout()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            <span>Se déconnecter</span>
          </button>
        </div>
      </div>
    </aside>
  `,
  styles: [`
    .sidebar {
      width: 230px;
      min-width: 230px;
      background-color: #002B49;
      color: #FFFFFF;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      position: sticky;
      top: 0;
      z-index: 100;
      box-shadow: 2px 0 10px rgba(0, 0, 0, 0.15);
      user-select: none;
    }

    .sidebar-top {
      padding-top: 140px;
    }

    .sidebar-nav {
      display: flex;
      flex-direction: column;
      gap: 6px;
      padding: 0 12px;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 12px 18px;
      border-radius: 8px;
      color: #FFFFFF;
      text-decoration: none;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.2s ease;
      cursor: pointer;
    }

    .nav-icon {
      width: 20px;
      height: 20px;
      flex-shrink: 0;
    }

    .nav-item:hover:not(.active) {
      background-color: rgba(255, 255, 255, 0.08);
      color: #FFFFFF;
    }

    /* Style exact de l'item actif dans la maquette (jaune doré avec texte noir) */
    .nav-item.active {
      background-color: #FFC72C;
      color: #000000;
      font-weight: 700;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
    }

    .nav-item.active .nav-icon {
      color: #000000;
      stroke-width: 2.2;
    }

    .sidebar-bottom {
      padding: 16px 12px 24px;
      position: relative;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
    }

    .profile-card {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 12px;
      border-radius: 8px;
      cursor: pointer;
      transition: background 0.2s ease;
    }

    .profile-card:hover, .profile-card.menu-open {
      background-color: rgba(255, 255, 255, 0.08);
    }

    .profile-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background-color: #8DA4B8;
      color: #FFFFFF;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .profile-avatar svg {
      width: 22px;
      height: 22px;
    }

    .profile-info {
      display: flex;
      flex-direction: column;
      flex: 1;
      overflow: hidden;
    }

    .profile-name {
      font-size: 13.5px;
      font-weight: 600;
      color: #FFFFFF;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .profile-role {
      font-size: 11px;
      color: #8DA4B8;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .chevron-icon {
      width: 16px;
      height: 16px;
      color: #8DA4B8;
      transition: transform 0.2s ease;
      flex-shrink: 0;
    }

    .chevron-icon.rotated {
      transform: rotate(180deg);
    }

    /* Menu déroulant profil */
    .profile-dropdown {
      position: absolute;
      bottom: calc(100% + 8px);
      left: 12px;
      right: 12px;
      background: #001F35;
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 10px;
      padding: 14px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4);
      z-index: 200;
    }

    .dropdown-header {
      display: flex;
      flex-direction: column;
      gap: 2px;
      margin-bottom: 12px;
    }

    .dropdown-header strong {
      font-size: 13px;
      color: #FFFFFF;
    }

    .dropdown-role {
      font-size: 11px;
      color: #8DA4B8;
    }

    .dropdown-section {
      margin-top: 10px;
    }

    .section-title {
      font-size: 11px;
      color: #8DA4B8;
      display: block;
      margin-bottom: 6px;
    }

    .role-switcher-buttons {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 6px;
    }

    .role-btn {
      padding: 6px;
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 6px;
      background: transparent;
      color: #CBD5E1;
      font-size: 11.5px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .role-btn:hover {
      background: rgba(255, 255, 255, 0.1);
      color: #FFFFFF;
    }

    .role-btn.active {
      background: #FFC72C;
      color: #000000;
      border-color: #FFC72C;
    }

    .dropdown-divider {
      height: 1px;
      background: rgba(255, 255, 255, 0.1);
      margin: 12px 0 10px;
    }

    .dropdown-logout-btn {
      width: 100%;
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 10px;
      border: none;
      background: rgba(239, 68, 68, 0.15);
      color: #FCA5A5;
      border-radius: 6px;
      font-size: 12.5px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .dropdown-logout-btn svg {
      width: 16px;
      height: 16px;
    }

    .dropdown-logout-btn:hover {
      background: #EF4444;
      color: #FFFFFF;
    }

    @media (max-width: 768px) {
      .sidebar {
        width: 72px;
        min-width: 72px;
      }
      .nav-label, .profile-info, .chevron-icon {
        display: none;
      }
      .sidebar-top {
        padding-top: 80px;
      }
      .nav-item {
        justify-content: center;
        padding: 12px;
      }
    }
  `]
})
export class NavbarComponent {
  showProfileMenu = false;

  constructor(
    public authService: AuthService,
    private router: Router
  ) {}

  toggleProfileMenu(): void {
    this.showProfileMenu = !this.showProfileMenu;
  }

  getDisplayName(): string {
    const fullName = this.authService.getUserFullName();
    if (fullName && fullName !== 'Utilisateur Test') {
      return fullName;
    }
    return this.authService.isAdmin() ? 'Administrateur' : 'Lecteur';
  }

  async onLogout(): Promise<void> {
    this.showProfileMenu = false;
    await this.authService.logout();
    this.router.navigate(['/login']);
  }

  switchRole(role: UserRole): void {
    this.authService.setMockUser(role);
    this.showProfileMenu = false;
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate(['/users']);
    });
  }
}

