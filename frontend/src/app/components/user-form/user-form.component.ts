import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { UserService } from '../../services/user.service';
import { NotificationService } from '../../services/notification.service';
import { CreateUserRequest, UpdateUserRequest, User, UserRole, UserStatus } from '../../models/user.model';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
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

      <!-- En-tête -->
      <div class="page-header">
        <h1 class="page-title">
          {{ isEditMode ? 'Modifier un utilisateur' : 'Ajouter un utilisateur' }}
        </h1>
        <p class="page-subtitle">
          {{ isEditMode ? 'Mettre à jour les informations du compte utilisateur.' : 'Renseignez les informations du nouvel utilisateur.' }}
        </p>
      </div>

      <!-- Chargement en mode édition -->
      <div class="loading-state" *ngIf="loading">
        <div class="spinner"></div>
        <p>Chargement des données de l'utilisateur...</p>
      </div>

      <!-- Formulaire principal -->
      <form [formGroup]="userForm" (ngSubmit)="onSubmit()" novalidate *ngIf="!loading">
        <!-- Carte 1 : Informations personnelles -->
        <div class="form-card">
          <div class="card-header">
            <h2 class="card-title">Informations personnelles</h2>
          </div>
          <div class="card-body">
            <div class="form-row-2col">
              <!-- Nom -->
              <div class="form-group" [class.has-error]="isFieldInvalid('nom')">
                <label for="nom">Nom <span class="required">*</span></label>
                <input
                  id="nom"
                  type="text"
                  formControlName="nom"
                  placeholder="Saisissez le nom"
                  class="form-control"
                />
                <div class="error-feedback" *ngIf="isFieldInvalid('nom')">
                  <span>Le nom est obligatoire (au moins 2 caractères).</span>
                </div>
              </div>

              <!-- Prénom -->
              <div class="form-group" [class.has-error]="isFieldInvalid('prenom')">
                <label for="prenom">Prénom <span class="required">*</span></label>
                <input
                  id="prenom"
                  type="text"
                  formControlName="prenom"
                  placeholder="Saisissez le prénom"
                  class="form-control"
                />
                <div class="error-feedback" *ngIf="isFieldInvalid('prenom')">
                  <span>Le prénom est obligatoire (au moins 2 caractères).</span>
                </div>
              </div>
            </div>

            <div class="form-row-2col">
              <!-- Email -->
              <div class="form-group" [class.has-error]="isFieldInvalid('email')">
                <label for="email">Email <span class="required">*</span></label>
                <input
                  id="email"
                  type="email"
                  formControlName="email"
                  placeholder="nom@exemple.ma"
                  class="form-control"
                />
                <div class="error-feedback" *ngIf="isFieldInvalid('email')">
                  <span>Veuillez renseigner un email valide (ex: nom&#64;exemple.ma).</span>
                </div>
              </div>

              <!-- Téléphone -->
              <div class="form-group" [class.has-error]="isFieldInvalid('telephone')">
                <label for="telephone">Téléphone</label>
                <input
                  id="telephone"
                  type="text"
                  formControlName="telephone"
                  placeholder="06 00 00 00 00"
                  class="form-control"
                />
                <div class="error-feedback" *ngIf="isFieldInvalid('telephone')">
                  <span>Format de numéro de téléphone invalide.</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Carte 2 : Compte utilisateur -->
        <div class="form-card">
          <div class="card-header">
            <h2 class="card-title">Compte utilisateur</h2>
          </div>
          <div class="card-body">
            <div class="form-row-2col">
              <!-- Identifiant -->
              <div class="form-group" [class.has-error]="isFieldInvalid('identifiant')">
                <label for="identifiant">Identifiant <span class="required">*</span></label>
                <input
                  id="identifiant"
                  type="text"
                  formControlName="identifiant"
                  placeholder="Saisissez un identifiant"
                  class="form-control"
                  [readonly]="isEditMode"
                  [class.readonly-input]="isEditMode"
                />
                <span class="field-hint" *ngIf="isEditMode">L'identifiant métier n'est pas modifiable</span>
                <div class="error-feedback" *ngIf="isFieldInvalid('identifiant')">
                  <span>L'identifiant est obligatoire (alphanumérique, au moins 3 caractères).</span>
                </div>
              </div>
            </div>

            <div class="form-row-2col">
              <!-- Rôle -->
              <div class="form-group">
                <label for="role">Rôle <span class="required">*</span></label>
                <div class="select-wrapper">
                  <select id="role" formControlName="role" class="form-control select-control">
                    <option value="LECTEUR">LECTEUR</option>
                    <option value="ADMINISTRATEUR">ADMINISTRATEUR</option>
                  </select>
                  <svg class="select-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </div>
              </div>

              <!-- Statut -->
              <div class="form-group">
                <label for="statut">Statut <span class="required">*</span></label>
                <div class="select-wrapper">
                  <select id="statut" formControlName="statut" class="form-control select-control">
                    <option value="ACTIF">Actif</option>
                    <option value="INACTIF">Inactif</option>
                  </select>
                  <svg class="select-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </div>
              </div>
            </div>

            <!-- Bandeau d'information Keycloak -->
            <div class="info-callout">
              <svg class="info-icon" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" fill="#0056B3" />
                <path d="M12 16V12M12 8H12.01" stroke="white" stroke-width="2" stroke-linecap="round" />
              </svg>
              <span class="info-text">Le mot de passe sera défini via Keycloak.</span>
            </div>
          </div>
        </div>

        <!-- Pied du formulaire : actions -->
        <div class="form-footer-actions">
          <div class="required-note">
            <span class="required">*</span> Champs obligatoires
          </div>
          <div class="action-buttons">
            <button
              type="button"
              class="btn-cancel"
              routerLink="/users"
              id="btn-cancel"
            >
              Annuler
            </button>
            <button
              type="submit"
              class="btn-save"
              [disabled]="submitting"
              id="btn-submit-user"
            >
              <span *ngIf="submitting" class="spinner-small"></span>
              <span>Enregistrer</span>
            </button>
          </div>
        </div>
      </form>

      <!-- Accent décoratif diagonal en bas à droite -->
      <div class="corner-accent" aria-hidden="true">
        <svg viewBox="0 0 140 100" fill="none">
          <polygon points="140,0 140,100 20,100" fill="#002B49" />
          <polygon points="140,40 140,100 65,100" fill="#FFC72C" />
        </svg>
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

    /* Titre et sous-titre */
    .page-header {
      margin-bottom: 24px;
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

    /* Cartes formulaire */
    .form-card {
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

    .card-body {
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 20px;
      background: #FFFFFF;
    }

    .form-row-2col {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
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

    .required {
      color: #DC2626;
      font-weight: 700;
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

    .readonly-input {
      background-color: #F1F5F9;
      color: #64748B;
      cursor: not-allowed;
    }

    .field-hint {
      font-size: 11px;
      color: #64748B;
      margin-top: 2px;
    }

    .has-error .form-control {
      border-color: #DC2626;
      background-color: #FFF8F8;
    }

    .error-feedback {
      font-size: 12px;
      color: #DC2626;
      margin-top: 2px;
    }

    /* Select avec chevron */
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

    /* Info Callout */
    .info-callout {
      background-color: #EBF3FC;
      border: 1px solid #D2E4F8;
      border-radius: 6px;
      padding: 12px 16px;
      display: flex;
      align-items: center;
      gap: 12px;
      margin-top: 4px;
    }

    .info-icon {
      width: 22px;
      height: 22px;
      flex-shrink: 0;
    }

    .info-text {
      font-size: 13.5px;
      color: #0056B3;
      font-weight: 500;
    }

    /* Actions du bas */
    .form-footer-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 24px;
      padding-bottom: 40px;
    }

    .required-note {
      font-size: 13px;
      color: #5A6B82;
    }

    .action-buttons {
      display: flex;
      gap: 16px;
      align-items: center;
    }

    .btn-cancel {
      padding: 10px 28px;
      background-color: #FFFFFF;
      border: 1.5px solid #0056B3;
      border-radius: 6px;
      color: #0056B3;
      font-weight: 600;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .btn-cancel:hover {
      background-color: #F0F6FC;
    }

    .btn-save {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 10px 28px;
      background-color: #FFC72C;
      border: none;
      border-radius: 6px;
      color: #000000;
      font-weight: 700;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.15s ease;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .btn-save:hover:not(:disabled) {
      background-color: #EBB21C;
    }

    .btn-save:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .spinner-small {
      width: 14px;
      height: 14px;
      border: 2px solid rgba(0, 0, 0, 0.25);
      border-top-color: #000000;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }

    .loading-state {
      padding: 60px;
      text-align: center;
      color: #5A6B82;
    }

    .spinner {
      width: 36px;
      height: 36px;
      border: 3px solid #D2E4F8;
      border-top-color: #0056B3;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin: 0 auto 12px;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
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

    @media (max-width: 768px) {
      .form-row-2col {
        grid-template-columns: 1fr;
      }
      .form-footer-actions {
        flex-direction: column-reverse;
        gap: 16px;
        align-items: stretch;
      }
      .action-buttons {
        justify-content: stretch;
      }
      .btn-cancel, .btn-save {
        flex: 1;
        text-align: center;
        justify-content: center;
      }
    }
  `]

})
export class UserFormComponent implements OnInit {
  userForm!: FormGroup;
  isEditMode = false;
  userId: number | null = null;
  loading = false;
  submitting = false;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private notificationService: NotificationService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initForm();

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEditMode = true;
      this.userId = Number(idParam);
      this.loadUserData(this.userId);
    }
  }

  private initForm(): void {
    this.userForm = this.fb.group({
      identifiant: [
        '',
        [Validators.required, Validators.minLength(3), Validators.pattern('^[a-zA-Z0-9._-]+$')]
      ],
      email: [
        '',
        [Validators.required, Validators.email, Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$')]
      ],
      nom: ['', [Validators.required, Validators.minLength(2)]],
      prenom: ['', [Validators.required, Validators.minLength(2)]],
      telephone: ['', [Validators.pattern('^[0-9+()\\s.-]{6,25}$')]],
      role: ['LECTEUR' as UserRole, [Validators.required]],
      statut: ['ACTIF' as UserStatus, [Validators.required]]
    });
  }

  private loadUserData(id: number): void {
    this.loading = true;
    this.userService.getUserById(id).subscribe({
      next: (user: User) => {
        this.loading = false;
        this.userForm.patchValue({
          identifiant: user.identifiant,
          email: user.email,
          nom: user.nom,
          prenom: user.prenom,
          telephone: user.telephone || '',
          role: user.role,
          statut: user.statut
        });
        // En mode édition, l'identifiant ne peut pas être modifié
        this.userForm.get('identifiant')?.disable();
      },
      error: err => {
        this.loading = false;
        this.notificationService.error(
          'Impossible de charger les données de l\'utilisateur à modifier.',
          'Erreur'
        );
        this.router.navigate(['/users']);
      }
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.userForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  onSubmit(): void {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      this.notificationService.warning('Veuillez corriger les erreurs de validation dans le formulaire.');
      return;
    }

    this.submitting = true;
    const formValues = this.userForm.getRawValue();

    if (this.isEditMode && this.userId) {
      const updateReq: UpdateUserRequest = {
        nom: formValues.nom.trim(),
        prenom: formValues.prenom.trim(),
        email: formValues.email.trim().toLowerCase(),
        telephone: formValues.telephone?.trim() || undefined,
        role: formValues.role,
        statut: formValues.statut
      };

      this.userService.updateUser(this.userId, updateReq).subscribe({
        next: updated => {
          this.submitting = false;
          this.notificationService.success(
            `L'utilisateur ${updated.prenom} ${updated.nom} a été mis à jour avec succès.`,
            'Modification enregistrée'
          );
          this.router.navigate(['/users']);
        },
        error: err => {
          this.submitting = false;
          const msg = err.error?.message || 'Erreur lors de la mise à jour de l\'utilisateur.';
          this.notificationService.error(msg, 'Échec de la modification');
        }
      });
    } else {
      const createReq: CreateUserRequest = {
        identifiant: formValues.identifiant.trim().toLowerCase(),
        nom: formValues.nom.trim(),
        prenom: formValues.prenom.trim(),
        email: formValues.email.trim().toLowerCase(),
        telephone: formValues.telephone?.trim() || undefined,
        role: formValues.role,
        statut: formValues.statut
      };

      this.userService.createUser(createReq).subscribe({
        next: created => {
          this.submitting = false;
          this.notificationService.success(
            `L'utilisateur ${created.prenom} ${created.nom} a été créé avec succès dans Keycloak et PostgreSQL.`,
            'Utilisateur créé'
          );
          this.router.navigate(['/users']);
        },
        error: err => {
          this.submitting = false;
          const msg = err.error?.message || 'Erreur lors de la création de l\'utilisateur.';
          this.notificationService.error(msg, 'Échec de la création');
        }
      });
    }
  }
}
