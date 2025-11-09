import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login';
import { PrescriptionListComponent } from './components/prescription-list/prescription-list';
import { PrescriptionForm } from './components/prescription-form/prescription-form';
import { PrescriptionCharts } from './components/prescription-charts/prescription-charts';
import { Sidebar } from './components/sidebar/sidebar';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: Sidebar,
    children: [
      { path: 'prescriptions', component: PrescriptionListComponent },
      { path: 'prescriptions/new', component: PrescriptionForm },
      { path: 'prescriptions/edit/:id', component: PrescriptionForm },
      { path: 'prescriptions/charts', component: PrescriptionCharts },
    ]
  },
  { path: '**', redirectTo: '/login' }
];
