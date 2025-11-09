import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { Router, ActivatedRoute } from '@angular/router';
import { PrescriptionService, Prescription } from '../../services/prescription';

@Component({
  selector: 'app-prescription-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCardModule,
    MatSnackBarModule
  ],
  templateUrl: './prescription-form.html',
  styleUrl: './prescription-form.scss',
})
export class PrescriptionForm implements OnInit {
  private fb = inject(FormBuilder);
  private prescriptionService = inject(PrescriptionService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private snackBar = inject(MatSnackBar);
  private cdr = inject(ChangeDetectorRef);

  prescriptionForm!: FormGroup;
  isEditMode = false;
  prescriptionId: number | null = null;
  isLoading = false;

  genders = [
    { value: 'MALE', label: 'Male' },
    { value: 'FEMALE', label: 'Female' },
    { value: 'OTHER', label: 'Other' }
  ];

  ngOnInit() {
    this.initializeForm();

    // Check if we're editing an existing prescription
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.prescriptionId = +params['id'];
        this.loadPrescription(this.prescriptionId);
      }
    });
  }

  private initializeForm() {
    this.prescriptionForm = this.fb.group({
      prescriptionDate: [new Date(), Validators.required],
      patientName: ['', [Validators.required, Validators.minLength(2)]],
      patientAge: ['', [Validators.required, Validators.min(0), Validators.max(150)]],
      patientGender: ['', Validators.required],
      diagnosis: ['', [Validators.required, Validators.minLength(3)]],
      medicines: ['', [Validators.required, Validators.minLength(3)]],
      nextVisitDate: ['', Validators.required]
    });
  }

  private loadPrescription(id: number) {
    this.isLoading = true;
    this.prescriptionService.getPrescription(id).subscribe({
      next: (prescription) => {
        this.prescriptionForm.patchValue({
          ...prescription,
          prescriptionDate: new Date(prescription.prescriptionDate),
          nextVisitDate: new Date(prescription.nextVisitDate)
        });
        // Defer loading state change to avoid ExpressionChangedAfterItHasBeenCheckedError
        setTimeout(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
        });
      },
      error: (error) => {
        console.error('Error loading prescription:', error);
        this.snackBar.open('Error loading prescription', 'Close', { duration: 3000 });
        // Defer loading state change to avoid ExpressionChangedAfterItHasBeenCheckedError
        setTimeout(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
        });
        this.router.navigate(['/prescriptions']);
      }
    });
  }

  onSubmit() {
    if (this.prescriptionForm.valid) {
      this.isLoading = true;
      const formValue = this.prescriptionForm.value;

      // Format dates for API
      const prescription: Prescription = {
        ...formValue,
        prescriptionDate: this.formatDate(formValue.prescriptionDate),
        nextVisitDate: this.formatDate(formValue.nextVisitDate)
      };

      const operation = this.isEditMode
        ? this.prescriptionService.updatePrescription(this.prescriptionId!, prescription)
        : this.prescriptionService.createPrescription(prescription);

      operation.subscribe({
        next: () => {
          const message = this.isEditMode ? 'Prescription updated successfully' : 'Prescription created successfully';
          this.snackBar.open(message, 'Close', { duration: 3000 });
          this.router.navigate(['/prescriptions']);
        },
        error: (error) => {
          console.error('Error saving prescription:', error);
          this.snackBar.open('Error saving prescription', 'Close', { duration: 3000 });
          // Defer loading state change to avoid ExpressionChangedAfterItHasBeenCheckedError
          setTimeout(() => {
            this.isLoading = false;
            this.cdr.detectChanges();
          });
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  private formatDate(date: Date | string): string {
    if (date instanceof Date) {
      return date.toISOString().split('T')[0];
    }
    return date;
  }

  private markFormGroupTouched() {
    Object.keys(this.prescriptionForm.controls).forEach(key => {
      const control = this.prescriptionForm.get(key);
      control?.markAsTouched();
    });
  }

  onCancel() {
    this.router.navigate(['/prescriptions']);
  }

  getErrorMessage(fieldName: string): string {
    const control = this.prescriptionForm.get(fieldName);
    if (control?.hasError('required')) {
      return `${this.getFieldLabel(fieldName)} is required`;
    }
    if (control?.hasError('minlength')) {
      return `${this.getFieldLabel(fieldName)} must be at least ${control.errors?.['minlength'].requiredLength} characters`;
    }
    if (control?.hasError('min')) {
      return `${this.getFieldLabel(fieldName)} must be at least ${control.errors?.['min'].min}`;
    }
    if (control?.hasError('max')) {
      return `${this.getFieldLabel(fieldName)} must be at most ${control.errors?.['max'].max}`;
    }
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      patientName: 'Patient Name',
      patientAge: 'Patient Age',
      patientGender: 'Patient Gender',
      diagnosis: 'Diagnosis',
      medicines: 'Medicines',
      prescriptionDate: 'Prescription Date',
      nextVisitDate: 'Next Visit Date'
    };
    return labels[fieldName] || fieldName;
  }
}
