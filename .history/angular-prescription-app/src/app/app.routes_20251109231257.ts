import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login';
import { PrescriptionListComponent } from './components/prescription-list/prescription-list';
import { PrescriptionForm } from './components/prescription-form/prescription-form';
import { PrescriptionChartsComponent } from './components/prescription-charts/prescription-charts';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'prescriptions', component: PrescriptionListComponent },
  { path: 'prescriptions/new', component: PrescriptionForm },
  { path: 'prescriptions/edit/:id', component: PrescriptionForm },
  { path: 'prescriptions/charts', component: PrescriptionChartsComponent },
  { path: '**', redirectTo: '/login' }
];
