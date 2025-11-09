import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { PrescriptionService, Prescription, PageResponse } from '../../services/prescription';

@Component({
  selector: 'app-prescription-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatCardModule
  ],
  templateUrl: './prescription-list.html',
  styleUrl: './prescription-list.scss',
})
export class PrescriptionListComponent implements OnInit {
  displayedColumns: string[] = [
    'id',
    'prescriptionDate',
    'patientName',
    'patientAge',
    'patientGender',
    'diagnosis',
    'medicines',
    'nextVisitDate',
    'actions'
  ];

  dataSource = new MatTableDataSource<Prescription>();
  loading = false;
  totalElements = 0;

  filterForm: FormGroup;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private prescriptionService: PrescriptionService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.filterForm = this.fb.group({
      startDate: [''],
      endDate: ['']
    });
  }

  ngOnInit(): void {
    this.loadPrescriptions();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadPrescriptions(page: number = 0): void {
    this.loading = true;
    const filters = this.filterForm.value;

    this.prescriptionService.getPrescriptions(
      page,
      10,
      filters.startDate ? this.formatDate(filters.startDate) : undefined,
      filters.endDate ? this.formatDate(filters.endDate) : undefined
    ).subscribe({
      next: (response: PageResponse<Prescription>) => {
        this.dataSource.data = response.content;
        this.totalElements = response.totalElements;
        // Defer loading state change to avoid ExpressionChangedAfterItHasBeenCheckedError
        setTimeout(() => {
          this.loading = false;
          this.cdr.detectChanges();
        });
      },
      error: (error: any) => {
        // Defer loading state change to avoid ExpressionChangedAfterItHasBeenCheckedError
        setTimeout(() => {
          this.loading = false;
          this.cdr.detectChanges();
        });
        this.snackBar.open('Error loading prescriptions', 'Close', { duration: 3000 });
        console.error('Error loading prescriptions:', error);
      }
    });
  }

  onPageChange(event: any): void {
    this.loadPrescriptions(event.pageIndex);
  }

  applyFilters(): void {
    this.loadPrescriptions();
  }

  clearFilters(): void {
    this.filterForm.reset();
    this.loadPrescriptions();
  }

  createPrescription(): void {
    this.router.navigate(['/prescriptions/new']);
  }

  editPrescription(prescription: Prescription): void {
    this.router.navigate(['/prescriptions/edit', prescription.id]);
  }

  deletePrescription(prescription: Prescription): void {
    if (confirm(`Are you sure you want to delete the prescription for ${prescription.patientName}?`)) {
      this.prescriptionService.deletePrescription(prescription.id!).subscribe({
        next: () => {
          this.snackBar.open('Prescription deleted successfully', 'Close', { duration: 3000 });
          this.loadPrescriptions();
        },
        error: (error: any) => {
          this.snackBar.open('Error deleting prescription', 'Close', { duration: 3000 });
          console.error('Error deleting prescription:', error);
        }
      });
    }
  }

  viewCharts(): void {
    this.router.navigate(['/prescriptions/charts']);
  }

  logout(): void {
    // Implement logout logic
    this.router.navigate(['/login']);
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}
