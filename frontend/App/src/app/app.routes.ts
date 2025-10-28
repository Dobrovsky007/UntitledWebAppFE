import { Routes } from '@angular/router';
import { Layout } from './layout/layout/layout';
import { Login } from './auth/login/login';
import { Register } from './auth/register/register';
import { UserProfile } from './user-profile/user-profile';
import { ExploreEvents } from './events/explore-events/explore-events';
import { Dashboard } from './dashboard/dashboard';
import { authGuard } from './shared/guards/auth.guard';
import { CreateEvents } from './createEvent/create-events';
import { EventDetails } from './events/event-details/event-details';

export const routes: Routes = [
  { 
    path: '', 
    redirectTo: '/auth/login', 
    pathMatch: 'full' 
  },
  {
    path: '',
    component: Layout,
    canActivate: [authGuard], // Protect the entire layout with auth guard
    children: [
      { path: 'explore-events', component: ExploreEvents },
      { path: 'dashboard', component: Dashboard },
      { path: 'profile', component: UserProfile },
      { path: 'create-events', component: CreateEvents },
      { path: 'event-details/:id', component: EventDetails },
    ]
  },
  { path: 'auth/login', component: Login },
  { path: 'auth/register', component: Register },
  { path: 'login', redirectTo: '/auth/login' }, // Redirect old login path
  { path: 'register', redirectTo: '/auth/register' }, // Redirect old register path
  { path: '**', redirectTo: '/auth/login' }, // Redirect any unknown routes to login
  { path: 'create', redirectTo: '/auth/events/login' },
  // { path: 'event/:id', component: EventDetails },
];
