import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { User, UserFilters, UserStatus } from '../../models/user.model';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="page-container">
      <!-- Fil d'Ariane -->
      <div class="breadcrumb">
        <svg class="home-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
        <span class="breadcrumb-separator">&gt;</span>
        <span class="breadcrumb-current">Gestion des utilisateurs</span>
      </div>

      <!-- En-tête de page -->
      <div class="page-header">
        <div class="header-left">
          <h1 class="page-title">Liste des utilisateurs</h1>
          <p class="page-subtitle">Consultez et gérez les utilisateurs de l'application.</p>
        </div>
        <div class="header-actions">
          <button
            *ngIf="authService.isAdmin()"
            class="btn-add-user"
            routerLink="/users/new"
            id="btn-add-user"
          >
            <span class="plus-icon">+</span>
            <span>Ajouter un utilisateur</span>
          </button>
        </div>
      </div>

      <!-- Carte des Filtres de recherche -->
      <div class="filter-card">
        <div class="card-header">
          <h2 class="card-title">Filtres de recherche</h2>
        </div>

        <form (ngSubmit)="applyFilters()" class="filter-form">
          <div class="filter-row-3col">
            <div class="form-group">
              <label for="filter-identifiant">Identifiant</label>
              <input
                id="filter-identifiant"
                type="text"
                placeholder="Saisissez un identifiant"
                [(ngModel)]="filters.identifiant"
                name="identifiant"
                class="form-control"
              />
            </div>

            <div class="form-group">
              <label for="filter-nom-prenom">Nom ou prénom</label>
              <input
                id="filter-nom-prenom"
                type="text"
                placeholder="Saisissez un nom ou un prénom"
                [(ngModel)]="filters.nomPrenom"
                name="nomPrenom"
                class="form-control"
              />
            </div>

            <div class="form-group">
              <label for="filter-email">Email</label>
              <input
                id="filter-email"
                type="text"
                placeholder="Saisissez une adresse email"
                [(ngModel)]="filters.email"
                name="email"
                class="form-control"
              />
            </div>
          </div>

          <div class="filter-row-actions">
            <div class="form-group status-filter-group">
              <label for="filter-statut">Statut</label>
              <div class="select-wrapper">
                <select
                  id="filter-statut"
                  [(ngModel)]="filters.statut"
                  name="statut"
                  class="form-control select-control"
                >
                  <option value="TOUS">Tous</option>
                  <option value="ACTIF">Actif</option>
                  <option value="INACTIF">Inactif</option>
                </select>
                <svg class="select-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </div>
            </div>

            <div class="filter-buttons-wrapper">
              <button type="submit" class="btn-search" [disabled]="loading" id="btn-submit-filter">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="search-icon">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <span>Rechercher</span>
              </button>

              <button type="button" class="btn-reset" (click)="resetFilters()" [disabled]="loading" id="btn-reset-filters">
                <span>Réinitialiser</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      <!-- Carte du Tableau des Utilisateurs -->
      <div class="table-card">
        <!-- Overlay chargement -->
        <div class="loading-overlay" *ngIf="loading">
          <div class="spinner"></div>
          <span>Chargement des utilisateurs en cours...</span>
        </div>

        <div class="table-responsive">
          <table class="data-table" id="users-table">
            <thead>
              <tr>
                <th>Identifiant</th>
                <th>Nom et prénom</th>
                <th>Email</th>
                <th>Téléphone</th>
                <th>Rôle</th>
                <th>Statut</th>
                <th class="th-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              <!-- État liste vide -->
              <tr *ngIf="!loading && users.length === 0">
                <td colspan="7" class="empty-state">
                  <div class="empty-state-content">
                    <p>Aucun utilisateur ne correspond à vos critères de recherche.</p>
                    <button class="btn-reset" (click)="resetFilters()">
                      Réinitialiser la recherche
                    </button>
                  </div>
                </td>
              </tr>

              <!-- Lignes utilisateurs -->
              <tr *ngFor="let user of users">
                <td class="td-identifiant">{{ user.identifiant }}</td>
                <td class="td-name">{{ user.prenom }} {{ user.nom }}</td>
                <td class="td-email">{{ user.email }}</td>
                <td class="td-phone">{{ user.telephone || '—' }}</td>
                <td class="td-role">{{ user.role }}</td>
                <td class="td-status">
                  <span
                    class="badge-status"
                    [ngClass]="user.statut === 'ACTIF' ? 'status-active' : 'status-inactive'"
                  >
                    {{ user.statut === 'ACTIF' ? 'Actif' : 'Inactif' }}
                  </span>
                </td>
                <td class="td-actions">
                  <div class="actions-wrapper">
                    <!-- Consulter -->
                    <button
                      class="btn-icon-action"
                      (click)="viewUser(user.id)"
                      title="Consulter"
                      [id]="'btn-view-' + user.id"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    </button>

                    <!-- Modifier (Admin uniquement) -->
                    <button
                      *ngIf="authService.isAdmin()"
                      class="btn-icon-action"
                      (click)="editUser(user.id)"
                      title="Modifier"
                      [id]="'btn-edit-' + user.id"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                      </svg>
                    </button>

                    <!-- Activer / Désactiver lien texte (Admin uniquement) -->
                    <button
                      *ngIf="authService.isAdmin()"
                      class="btn-text-action"
                      (click)="promptToggleStatus(user)"
                      [id]="'btn-toggle-' + user.id"
                    >
                      {{ user.statut === 'ACTIF' ? 'Désactiver' : 'Activer' }}
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Pagination et Compteurs -->
      <div class="pagination-footer" *ngIf="!loading && totalElements > 0">
        <div class="pagination-info">
          {{ getFromIndex() }} – {{ getToIndex() }} sur {{ totalElements }} utilisateurs
        </div>

        <div class="pagination-controls">
          <button
            class="btn-page-nav"
            [disabled]="filters.page === 0"
            (click)="onPageChange(filters.page! - 1)"
            title="Page précédente"
          >
            &lt;
          </button>

          <span class="page-badge-active">
            {{ (filters.page || 0) + 1 }}
          </span>

          <button
            class="btn-page-nav"
            [disabled]="(filters.page! + 1) >= totalPages"
            (click)="onPageChange(filters.page! + 1)"
            title="Page suivante"
          >
            &gt;
          </button>
        </div>
      </div>

      <!-- Note en bas de page -->
      <div class="page-footer-note">
        <span>Données fictives · Test technique</span>
      </div>

      <!-- Accent décoratif diagonal en bas à droite -->
      <div class="corner-accent" aria-hidden="true">
        <svg viewBox="0 0 140 100" fill="none">
          <polygon points="140,0 140,100 20,100" fill="#002B49" />
          <polygon points="140,40 140,100 65,100" fill="#FFC72C" />
        </svg>
      </div>
    </div>

    <!-- Modale de Confirmation de Changement de Statut -->
    <div class="modal-backdrop" *ngIf="confirmModalUser">
      <div class="modal-card">
        <div class="modal-header">
          <div class="modal-icon" [ngClass]="confirmModalUser.statut === 'ACTIF' ? 'modal-icon-danger' : 'modal-icon-success'">
            <svg *ngIf="confirmModalUser.statut === 'ACTIF'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
            <svg *ngIf="confirmModalUser.statut === 'INACTIF'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </div>
          <h3 class="modal-title">
            {{ getModalTitle() }}
          </h3>
        </div>

        <div class="modal-body">
          <p>
            Voulez-vous vraiment changer le statut de l'utilisateur
            <strong>{{ confirmModalUser.prenom }} {{ confirmModalUser.nom }}</strong> ({{ confirmModalUser.identifiant }}) vers
            <strong>{{ confirmModalUser.statut === 'ACTIF' ? 'INACTIF' : 'ACTIF' }}</strong> ?
          </p>
          <p class="modal-note" *ngIf="confirmModalUser.statut === 'ACTIF'">
            Le compte sera immédiatement désactivé dans Keycloak et ses sessions en cours seront révoquées.
          </p>
        </div>

        <div class="modal-footer">
          <button class="btn-cancel-modal" (click)="cancelModal()" [disabled]="toggleSubmitting">
            Annuler
          </button>
          <button
            class="btn-modal-confirm"
            [ngClass]="confirmModalUser.statut === 'ACTIF' ? 'btn-danger' : 'btn-success'"
            (click)="confirmToggleStatus()"
            [disabled]="toggleSubmitting"
          >
            <span *ngIf="toggleSubmitting" class="mini-spinner"></span>
            <span>{{ confirmModalUser.statut === 'ACTIF' ? 'Désactiver' : 'Activer' }}</span>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-container {
      max-width: 1240px;
      margin: 0;
      padding: 24px 36px 60px;
      position: relative;
      min-height: 100vh;
      box-sizing: border-box;
    }

    /* Fil d'Ariane */
    .breadcrumb {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13.5px;
      color: #5A6B82;
      margin-bottom: 20px;
    }

    .home-icon {
      width: 17px;
      height: 17px;
      color: #5A6B82;
    }

    .breadcrumb-separator {
      color: #8DA4B8;
      font-size: 14px;
    }

    .breadcrumb-current {
      color: #002B49;
      font-weight: 500;
    }

    /* En-tête */
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 24px;
      gap: 16px;
    }

    .page-title {
      font-size: 32px;
      font-weight: 800;
      color: #002B49;
      letter-spacing: -0.5px;
      margin: 0 0 6px 0;
    }

    .page-subtitle {
      font-size: 15px;
      color: #5A6B82;
      margin: 0;
    }

    .btn-add-user {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 10px 22px;
      background-color: #FFC72C;
      color: #000000;
      border: none;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 700;
      cursor: pointer;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      transition: all 0.15s ease;
      text-decoration: none;
      white-space: nowrap;
    }

    .btn-add-user:hover {
      background-color: #EBB21C;
    }

    .plus-icon {
      font-size: 17px;
      line-height: 1;
    }

    /* Carte des Filtres */
    .filter-card {
      border: 1px solid #D2E4F8;
      border-radius: 8px;
      overflow: hidden;
      background: #FFFFFF;
      margin-bottom: 24px;
      box-shadow: 0 1px 3px rgba(0, 43, 73, 0.03);
    }

    .card-header {
      background-color: #EBF3FC;
      border-bottom: 1px solid #D2E4F8;
      padding: 12px 24px;
    }

    .card-title {
      font-size: 16px;
      font-weight: 700;
      color: #0056B3;
      margin: 0;
    }

    .filter-form {
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .filter-row-3col {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
    }

    .filter-row-actions {
      display: flex;
      align-items: flex-end;
      gap: 20px;
    }

    .status-filter-group {
      width: 280px;
    }

    .filter-buttons-wrapper {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .form-group label {
      font-size: 13.5px;
      font-weight: 600;
      color: #002B49;
    }

    .form-control {
      padding: 10px 14px;
      border: 1.5px solid #D0D9E5;
      border-radius: 6px;
      font-size: 14px;
      color: #0A192F;
      background-color: #FFFFFF;
      transition: border-color 0.15s, box-shadow 0.15s;
      font-family: inherit;
    }

    .form-control:focus {
      outline: none;
      border-color: #0056B3;
      box-shadow: 0 0 0 3px rgba(0, 86, 179, 0.12);
    }

    .form-control::placeholder {
      color: #8FA2B6;
    }

    .select-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }

    .select-control {
      width: 100%;
      appearance: none;
      -webkit-appearance: none;
      cursor: pointer;
      padding-right: 36px;
    }

    .select-chevron {
      position: absolute;
      right: 12px;
      width: 18px;
      height: 18px;
      color: #002B49;
      pointer-events: none;
    }

    .btn-search {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 10px 22px;
      background-color: #FFFFFF;
      border: 1.5px solid #0056B3;
      border-radius: 6px;
      color: #0056B3;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .btn-search:hover {
      background-color: #F0F6FC;
    }

    .search-icon {
      width: 16px;
      height: 16px;
    }

    .btn-reset {
      display: inline-flex;
      align-items: center;
      padding: 10px 22px;
      background-color: #FFFFFF;
      border: 1.5px solid #0056B3;
      border-radius: 6px;
      color: #0056B3;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .btn-reset:hover {
      background-color: #F0F6FC;
    }

    /* Tableau */
    .table-card {
      border: 1px solid #D2E4F8;
      border-radius: 8px;
      overflow: hidden;
      background: #FFFFFF;
      position: relative;
      box-shadow: 0 1px 3px rgba(0, 43, 73, 0.03);
    }

    .table-responsive {
      width: 100%;
      overflow-x: auto;
    }

    .data-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
      font-size: 13.5px;
    }

    .data-table thead th {
      background-color: #EBF3FC;
      color: #0056B3;
      font-weight: 700;
      padding: 14px 20px;
      border-bottom: 1px solid #D2E4F8;
      white-space: nowrap;
    }

    .th-actions {
      text-align: left;
    }

    .data-table tbody td {
      padding: 14px 20px;
      border-bottom: 1px solid #EBF1F7;
      color: #0A192F;
      vertical-align: middle;
    }

    .data-table tbody tr:last-child td {
      border-bottom: none;
    }

    .data-table tbody tr:hover {
      background-color: #F8FAFD;
    }

    .td-identifiant {
      font-weight: 500;
    }

    .td-name {
      font-weight: 500;
    }

    /* Badges de statut */
    .badge-status {
      display: inline-block;
      font-size: 12.5px;
      font-weight: 600;
      padding: 4px 14px;
      border-radius: 4px;
      text-align: center;
    }

    .status-active {
      background-color: #E6F9F0;
      color: #107C41;
    }

    .status-inactive {
      background-color: #EFEFEF;
      color: #595959;
    }

    /* Actions */
    .actions-wrapper {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .btn-icon-action {
      background: transparent;
      border: none;
      padding: 4px;
      cursor: pointer;
      color: #002B49;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: color 0.15s ease;
    }

    .btn-icon-action svg {
      width: 18px;
      height: 18px;
    }

    .btn-icon-action:hover {
      color: #0056B3;
    }

    .btn-text-action {
      background: transparent;
      border: none;
      color: #0056B3;
      font-size: 13.5px;
      font-weight: 600;
      cursor: pointer;
      padding: 0;
      margin-left: 4px;
    }

    .btn-text-action:hover {
      text-decoration: underline;
    }

    /* Pagination */
    .pagination-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 18px;
      padding: 4px 0;
    }

    .pagination-info {
      font-size: 13.5px;
      color: #002B49;
    }

    .pagination-controls {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .btn-page-nav {
      width: 32px;
      height: 32px;
      background: #FFFFFF;
      border: 1px solid #D0D9E5;
      border-radius: 4px;
      color: #5A6B82;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 13px;
      font-weight: 600;
      transition: all 0.15s;
    }

    .btn-page-nav:hover:not(:disabled) {
      background: #F0F6FC;
      color: #002B49;
      border-color: #0056B3;
    }

    .btn-page-nav:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    .page-badge-active {
      width: 32px;
      height: 32px;
      background-color: #FFC72C;
      color: #000000;
      border-radius: 4px;
      font-weight: 700;
      font-size: 13.5px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    /* Note Données fictives */
    .page-footer-note {
      margin-top: 36px;
      font-size: 12.5px;
      color: #8DA4B8;
    }

    /* Accent diagonal en bas à droite */
    .corner-accent {
      position: fixed;
      bottom: 0;
      right: 0;
      width: 140px;
      height: 100px;
      pointer-events: none;
      z-index: 10;
    }

    .corner-accent svg {
      width: 100%;
      height: 100%;
    }

    /* Loading overlay */
    .loading-overlay {
      position: absolute;
      inset: 0;
      background: rgba(255, 255, 255, 0.8);
      z-index: 10;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 12px;
      color: #5A6B82;
      font-size: 14px;
    }

    .spinner {
      width: 36px;
      height: 36px;
      border: 3px solid #D2E4F8;
      border-top-color: #0056B3;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .empty-state {
      padding: 48px 24px;
      text-align: center;
      color: #5A6B82;
    }

    .empty-state-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 14px;
    }

    /* Modale */
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 43, 73, 0.4);
      backdrop-filter: blur(2px);
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
    }

    .modal-card {
      background: #FFFFFF;
      border-radius: 12px;
      width: 100%;
      max-width: 480px;
      box-shadow: 0 20px 30px rgba(0, 0, 0, 0.2);
      overflow: hidden;
    }

    .modal-header {
      padding: 20px 24px;
      display: flex;
      align-items: center;
      gap: 14px;
      border-bottom: 1px solid #EBF1F7;
    }

    .modal-icon {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .modal-icon svg {
      width: 20px;
      height: 20px;
    }

    .modal-icon-danger {
      background: #FEE2E2;
      color: #DC2626;
    }

    .modal-icon-success {
      background: #DCFCE7;
      color: #16A34A;
    }

    .modal-title {
      font-size: 18px;
      font-weight: 700;
      color: #002B49;
      margin: 0;
    }

    .modal-body {
      padding: 20px 24px;
      font-size: 14px;
      color: #0A192F;
      line-height: 1.5;
    }

    .modal-note {
      margin-top: 10px;
      font-size: 12.5px;
      color: #5A6B82;
      background: #F8FAFD;
      padding: 10px;
      border-radius: 6px;
      border-left: 3px solid #FFC72C;
    }

    .modal-footer {
      padding: 16px 24px;
      background: #F8FAFD;
      display: flex;
      justify-content: flex-end;
      gap: 12px;
    }

    .btn-cancel-modal {
      padding: 8px 18px;
      background: #FFFFFF;
      border: 1.5px solid #0056B3;
      border-radius: 6px;
      color: #0056B3;
      font-weight: 600;
      font-size: 13.5px;
      cursor: pointer;
    }

    .btn-modal-confirm {
      padding: 8px 18px;
      border: none;
      border-radius: 6px;
      font-size: 13.5px;
      font-weight: 600;
      color: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .btn-danger { background: #DC2626; }
    .btn-danger:hover { background: #B91C1C; }
    .btn-success { background: #16A34A; }
    .btn-success:hover { background: #15803D; }

    .mini-spinner {
      width: 14px;
      height: 14px;
      border: 2px solid rgba(255, 255, 255, 0.4);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }

    @media (max-width: 900px) {
      .filter-row-3col {
        grid-template-columns: 1fr;
      }
      .filter-row-actions {
        flex-direction: column;
        align-items: stretch;
      }
      .status-filter-group {
        width: 100%;
      }
    }
  `]

})
export class UserListComponent implements OnInit {
  users: User[] = [];
  loading = false;
  totalElements = 0;
  totalPages = 0;

  filters: UserFilters = {
    identifiant: '',
    nom: '',
    prenom: '',
    email: '',
    statut: 'TOUS',
    page: 0,
    size: 10,
    sortBy: 'id',
    sortDir: 'asc'
  };

  confirmModalUser: User | null = null;
  toggleSubmitting = false;

  constructor(
    private userService: UserService,
    public authService: AuthService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.userService.getUsers(this.filters).subscribe({
      next: res => {
        this.users = res.content || [];
        this.totalElements = res.totalElements || 0;
        this.totalPages = res.totalPages || 0;
        this.loading = false;
      },
      error: err => {
        this.loading = false;
        this.notificationService.error(
          'Impossible de charger la liste des utilisateurs. Vérifiez la connexion serveur.',
          'Erreur de chargement'
        );
      }
    });
  }

  applyFilters(): void {
    this.filters.page = 0;
    this.loadUsers();
  }

  resetFilters(): void {
    this.filters = {
      identifiant: '',
      nom: '',
      prenom: '',
      email: '',
      statut: 'TOUS',
      page: 0,
      size: 10,
      sortBy: 'id',
      sortDir: 'asc'
    };
    this.loadUsers();
  }

  onPageChange(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.filters.page = page;
      this.loadUsers();
    }
  }

  onPageSizeChange(size: number): void {
    this.filters.size = Number(size);
    this.filters.page = 0;
    this.loadUsers();
  }

  getFromIndex(): number {
    if (this.totalElements === 0) return 0;
    return (this.filters.page || 0) * (this.filters.size || 10) + 1;
  }

  getToIndex(): number {
    const end = ((this.filters.page || 0) + 1) * (this.filters.size || 10);
    return Math.min(end, this.totalElements);
  }

  viewUser(id: number): void {
    this.router.navigate(['/users', id]);
  }

  editUser(id: number): void {
    this.router.navigate(['/users', id, 'edit']);
  }

  promptToggleStatus(user: User): void {
    if (!this.authService.isAdmin()) {
      this.notificationService.error('Seuls les administrateurs peuvent modifier le statut d\'un utilisateur.');
      return;
    }

    // Protection immédiate côté frontend contre la désactivation du dernier administrateur actif
    if (user.role === 'ADMINISTRATEUR' && user.statut === 'ACTIF') {
      const activeAdmins = this.users.filter(u => u.role === 'ADMINISTRATEUR' && u.statut === 'ACTIF');
      if (activeAdmins.length <= 1) {
        this.notificationService.warning(
          'Action impossible : vous ne pouvez pas désactiver le dernier administrateur actif du système.',
          'Règle de sécurité'
        );
        return;
      }
    }

    this.confirmModalUser = user;
  }

  getModalTitle(): string {
    if (!this.confirmModalUser) return '';
    return this.confirmModalUser.statut === 'ACTIF' ? "Désactiver l'utilisateur" : "Réactiver l'utilisateur";
  }

  cancelModal(): void {
    this.confirmModalUser = null;
    this.toggleSubmitting = false;
  }

  confirmToggleStatus(): void {
    if (!this.confirmModalUser) return;

    const user = this.confirmModalUser;
    const targetStatus: UserStatus = user.statut === 'ACTIF' ? 'INACTIF' : 'ACTIF';

    this.toggleSubmitting = true;
    this.userService.updateUserStatus(user.id, targetStatus).subscribe({
      next: updated => {
        this.toggleSubmitting = false;
        this.confirmModalUser = null;
        this.notificationService.success(
          `Le statut de ${updated.prenom} ${updated.nom} est désormais ${updated.statut}.`,
          'Statut mis à jour'
        );
        this.loadUsers();
      },
      error: err => {
        this.toggleSubmitting = false;
        const msg = err.error?.message || 'Une erreur est survenue lors du changement de statut.';
        this.notificationService.error(msg, 'Échec de la modification');
      }
    });
  }
}
