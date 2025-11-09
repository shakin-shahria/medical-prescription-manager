import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { PrescriptionListComponent } from './components/prescription-list/prescription-list.component';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'prescriptions', component: PrescriptionListComponent },
  { path: '**', redirectTo: '/login' }
];
