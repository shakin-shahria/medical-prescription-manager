import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface Prescription {
  id?: number;
  prescriptionDate: string;
  patientName: string;
  patientAge: number;
  patientGender: string;
  diagnosis: string;
  medicines: string;
  nextVisitDate: string;
}

export interface PageResponse<T> {
  content: T[];
  pageable: any;
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class PrescriptionService {
  private readonly API_URL = 'http://localhost:8080/api/prescriptions';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  getPrescriptions(
    page: number = 0,
    size: number = 10,
    startDate?: string,
    endDate?: string
  ): Observable<PageResponse<Prescription>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (startDate) {
      params = params.set('startDate', startDate);
    }
    if (endDate) {
      params = params.set('endDate', endDate);
    }

    return this.http.get<PageResponse<Prescription>>(this.API_URL, {
      headers: this.authService.getAuthHeaders(),
      params
    });
  }

  getPrescription(id: number): Observable<Prescription> {
    return this.http.get<Prescription>(`${this.API_URL}/${id}`, {
      headers: this.authService.getAuthHeaders()
    });
  }

  createPrescription(prescription: Prescription): Observable<Prescription> {
    return this.http.post<Prescription>(this.API_URL, prescription, {
      headers: this.authService.getAuthHeaders()
    });
  }

  updatePrescription(id: number, prescription: Prescription): Observable<Prescription> {
    return this.http.put<Prescription>(`${this.API_URL}/${id}`, prescription, {
      headers: this.authService.getAuthHeaders()
    });
  }

  deletePrescription(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`, {
      headers: this.authService.getAuthHeaders()
    });
  }
}
