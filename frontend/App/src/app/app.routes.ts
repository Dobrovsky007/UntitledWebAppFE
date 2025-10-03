import { Routes } from '@angular/router';
import { Layout } from './layout/layout/layout';
import { ExploreEvents } from './events/explore-events/explore-events';
import { UserProfile } from './user-profile/user-profile';
import { Login } from './auth/login/login';
import { Register } from './auth/register/register';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'register', component: Register },

  {
    path: 'app',
    component: Layout,
    children: [
      { path: 'explore-events', component: ExploreEvents },
      { path: 'my-events', component: ExploreEvents },
      { path: 'create-event', component: ExploreEvents },
      { path: 'notifications', component: ExploreEvents },
      { path: 'profile', component: UserProfile },
      { path: '', redirectTo: 'explore-events', pathMatch: 'full' }
    ]
  },

  { path: '**', redirectTo: '/login' }
];
