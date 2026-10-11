export type UserRole = 'ADMINISTRATEUR' | 'LECTEUR';
export type UserStatus = 'ACTIF' | 'INACTIF';

export interface User {
  id: number;
  keycloakUserId: string;
  identifiant: string;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  statut: UserStatus;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserRequest {
  identifiant: string;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  role: UserRole;
  statut: UserStatus;
}

export interface UpdateUserRequest {
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  role: UserRole;
  statut: UserStatus;
}

export interface StatusUpdateRequest {
  statut: UserStatus;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface UserFilters {
  identifiant?: string;
  nom?: string;
  prenom?: string;
  nomPrenom?: string;
  email?: string;
  statut?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}
