import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import {
  CreateUserRequest,
  PageResponse,
  StatusUpdateRequest,
  UpdateUserRequest,
  User,
  UserFilters,
  UserStatus
} from '../models/user.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/users`;

  // Jeu de données local pour prévisualisation immédiate si le serveur backend n'est pas encore démarré
  private mockUsers: User[] = [
    {
      id: 1,
      keycloakUserId: '11111111-1111-1111-1111-111111111111',
      identifiant: 's.benjelloun',
      nom: 'Benjelloun',
      prenom: 'Sara',
      email: 's.benjelloun@exemple.ma',
      telephone: '06 98 76 54 32',
      statut: 'ACTIF',
      role: 'ADMINISTRATEUR',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 2,
      keycloakUserId: '22222222-2222-2222-2222-222222222222',
      identifiant: 'y.amrani',
      nom: 'El Amrani',
      prenom: 'Youssef',
      email: 'y.amrani@exemple.ma',
      telephone: '06 12 34 56 78',
      statut: 'ACTIF',
      role: 'LECTEUR',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 3,
      keycloakUserId: '33333333-3333-3333-3333-333333333333',
      identifiant: 'o.berrada',
      nom: 'Berrada',
      prenom: 'Omar',
      email: 'o.berrada@exemple.ma',
      telephone: '06 22 33 44 55',
      statut: 'INACTIF',
      role: 'LECTEUR',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 4,
      keycloakUserId: '44444444-4444-4444-4444-444444444444',
      identifiant: 'n.alami',
      nom: 'Alami',
      prenom: 'Nadia',
      email: 'n.alami@exemple.ma',
      telephone: '06 55 44 33 22',
      statut: 'ACTIF',
      role: 'LECTEUR',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  getUsers(filters: UserFilters = {}): Observable<PageResponse<User>> {
    let params = new HttpParams();

    if (filters.identifiant?.trim()) {
      params = params.set('identifiant', filters.identifiant.trim());
    }
    if (filters.nom?.trim()) {
      params = params.set('nom', filters.nom.trim());
    }
    if (filters.prenom?.trim()) {
      params = params.set('prenom', filters.prenom.trim());
    }
    if (filters.nomPrenom?.trim()) {
      params = params.set('nomPrenom', filters.nomPrenom.trim());
    }
    if (filters.email?.trim()) {
      params = params.set('email', filters.email.trim());
    }
    if (filters.statut && filters.statut !== 'TOUS') {
      params = params.set('statut', filters.statut);
    }

    params = params.set('page', (filters.page ?? 0).toString());
    params = params.set('size', (filters.size ?? 10).toString());
    if (filters.sortBy) {
      params = params.set('sortBy', filters.sortBy);
    }
    if (filters.sortDir) {
      params = params.set('sortDir', filters.sortDir);
    }

    return this.http.get<PageResponse<User>>(this.apiUrl, { params }).pipe(
      catchError(err => {
        // En mode démo autonome ou si l'API n'est pas encore démarrée, filtrer la liste locale
        if (this.authService.isMockMode() || err.status === 0) {
          console.info('[UserService] Utilisation des données locales de démo');
          return of(this.getMockPageResponse(filters));
        }
        throw err;
      })
    );
  }

  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`).pipe(
      catchError(err => {
        if (this.authService.isMockMode() || err.status === 0) {
          const user = this.mockUsers.find(u => u.id === id);
          if (user) return of(user);
        }
        throw err;
      })
    );
  }

  getCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/me`).pipe(
      catchError(err => {
        if (this.authService.isMockMode() || err.status === 0) {
          const profile = this.authService.getProfile();
          const found = this.mockUsers.find(u => u.identifiant === profile?.username);
          return of(found || this.mockUsers[0]);
        }
        throw err;
      })
    );
  }

  createUser(request: CreateUserRequest): Observable<User> {
    return this.http.post<User>(this.apiUrl, request).pipe(
      catchError(err => {
        if (this.authService.isMockMode() || err.status === 0) {
          // Simulation création locale
          const newUser: User = {
            id: Math.max(...this.mockUsers.map(u => u.id), 0) + 1,
            keycloakUserId: 'mock-uuid-' + Date.now(),
            identifiant: request.identifiant.toLowerCase(),
            nom: request.nom,
            prenom: request.prenom,
            email: request.email.toLowerCase(),
            telephone: request.telephone,
            role: request.role,
            statut: request.statut,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          this.mockUsers.push(newUser);
          return of(newUser);
        }
        throw err;
      })
    );
  }

  updateUser(id: number, request: UpdateUserRequest): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}`, request).pipe(
      catchError(err => {
        if (this.authService.isMockMode() || err.status === 0) {
          const index = this.mockUsers.findIndex(u => u.id === id);
          if (index !== -1) {
            this.mockUsers[index] = {
              ...this.mockUsers[index],
              nom: request.nom,
              prenom: request.prenom,
              email: request.email.toLowerCase(),
              telephone: request.telephone,
              role: request.role,
              statut: request.statut,
              updatedAt: new Date().toISOString()
            };
            return of(this.mockUsers[index]);
          }
        }
        throw err;
      })
    );
  }

  updateUserStatus(id: number, statut: UserStatus): Observable<User> {
    const payload: StatusUpdateRequest = { statut };
    return this.http.patch<User>(`${this.apiUrl}/${id}/status`, payload).pipe(
      catchError(err => {
        if (this.authService.isMockMode() || err.status === 0) {
          const user = this.mockUsers.find(u => u.id === id);
          if (user) {
            user.statut = statut;
            user.updatedAt = new Date().toISOString();
            return of(user);
          }
        }
        throw err;
      })
    );
  }

  private getMockPageResponse(filters: UserFilters): PageResponse<User> {
    let filtered = [...this.mockUsers];

    if (filters.identifiant?.trim()) {
      const q = filters.identifiant.trim().toLowerCase();
      filtered = filtered.filter(u => u.identifiant.toLowerCase().includes(q));
    }
    if (filters.nom?.trim()) {
      const q = filters.nom.trim().toLowerCase();
      filtered = filtered.filter(u => u.nom.toLowerCase().includes(q));
    }
    if (filters.prenom?.trim()) {
      const q = filters.prenom.trim().toLowerCase();
      filtered = filtered.filter(u => u.prenom.toLowerCase().includes(q));
    }
    if (filters.nomPrenom?.trim()) {
      const q = filters.nomPrenom.trim().toLowerCase();
      filtered = filtered.filter(u => u.nom.toLowerCase().includes(q) || u.prenom.toLowerCase().includes(q));
    }
    if (filters.email?.trim()) {
      const q = filters.email.trim().toLowerCase();
      filtered = filtered.filter(u => u.email.toLowerCase().includes(q));
    }
    if (filters.statut && filters.statut !== 'TOUS') {
      filtered = filtered.filter(u => u.statut === filters.statut);
    }

    const page = filters.page ?? 0;
    const size = filters.size ?? 10;
    const totalElements = filtered.length;
    const totalPages = Math.ceil(totalElements / size) || 1;
    const startIndex = page * size;
    const content = filtered.slice(startIndex, startIndex + size);

    return {
      content,
      page,
      size,
      totalElements,
      totalPages,
      first: page === 0,
      last: page >= totalPages - 1
    };
  }
}
