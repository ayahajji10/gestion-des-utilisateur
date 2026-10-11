import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { UserListComponent } from './components/user-list/user-list.component';
import { UserFormComponent } from './components/user-form/user-form.component';
import { UserDetailComponent } from './components/user-detail/user-detail.component';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'users'
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'users',
    component: UserListComponent,
    canActivate: [authGuard]
  },
  {
    path: 'users/new',
    component: UserFormComponent,
    canActivate: [authGuard, adminGuard]
  },
  {
    path: 'users/:id',
    component: UserDetailComponent,
    canActivate: [authGuard]
  },
  {
    path: 'users/:id/edit',
    component: UserFormComponent,
    canActivate: [authGuard, adminGuard]
  },
  {
    path: '**',
    redirectTo: 'users'
  }
];
