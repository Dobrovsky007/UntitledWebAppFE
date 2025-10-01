import { Routes } from '@angular/router';
import { Login } from './auth/login/login';
import { Register } from './auth/register/register';
import { UserProfile } from './user-profile/user-profile';
import { ExploreEvents } from './events/explore-events/explore-events';
import { Layout } from './layout/layout/layout';



export const routes: Routes = [
    {
    path: '',
    component: Layout,
    children: [
      { path: 'explore-events', component: ExploreEvents},
      { path: 'my-events', component: ExploreEvents },
      { path: 'create-event', component: ExploreEvents },
      { path: 'notifications', component: ExploreEvents },
      { path: 'profile', component: UserProfile },
      { path: '', redirectTo: 'explore-events', pathMatch: 'full' }
    ]
  },

  // public pages
  { path: 'login', component: Login },
  { path: 'register', component: Register },

  { path: '**', redirectTo: '' }
    
];
