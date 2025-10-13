import { Routes } from '@angular/router';
import { Layout } from './layout/layout/layout';
import { Login } from './auth/login/login';
import { Register } from './auth/register/register';
import { UserProfile } from './user-profile/user-profile';
import { ExploreEvents } from './events/explore-events/explore-events';
import { authGuard } from './shared/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: Layout,
    children: [
      { path: '', redirectTo: '/explore-events', pathMatch: 'full' },
      { path: 'explore-events', component: ExploreEvents },
      { path: 'profile', component: UserProfile, canActivate: [authGuard] }
    ]
  },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: '**', redirectTo: '/explore-events' }
];
