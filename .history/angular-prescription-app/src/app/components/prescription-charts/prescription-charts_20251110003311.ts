import { Component, inject, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import { PrescriptionService, Prescription } from '../../services/prescription';
import { Chart, registerables } from 'chart.js';

// Register Chart.js components
Chart.register(...registerables);

interface ChartData {
  labels: string[];
  data: number[];
}

@Component({
  selector: 'app-prescription-charts',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './prescription-charts.html',
  styleUrl: './prescription-charts.scss',
})
export class PrescriptionCharts implements OnInit, AfterViewInit {
  private prescriptionService = inject(PrescriptionService);
  private router = inject(Router);

  @ViewChild('genderChartCanvas', { static: false }) genderChartCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('ageChartCanvas', { static: false }) ageChartCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('dailyChartCanvas', { static: false }) dailyChartCanvas!: ElementRef<HTMLCanvasElement>;

  isLoading = false;
  prescriptions: Prescription[] = [];
  genderChart: Chart | null = null;
  ageChart: Chart | null = null;
  dailyChart: Chart | null = null;

  ngOnInit() {
    this.loadPrescriptions();
  }

  ngAfterViewInit() {
    // Charts will be created after data is loaded
  }

  ngOnDestroy() {
    // Clean up charts
    if (this.genderChart) {
      this.genderChart.destroy();
    }
    if (this.ageChart) {
      this.ageChart.destroy();
    }
    if (this.dailyChart) {
      this.dailyChart.destroy();
    }
  }

  private loadPrescriptions() {
    this.isLoading = true;
    // Load all prescriptions for charts (you might want to add pagination support later)
    this.prescriptionService.getPrescriptions(0, 1000).subscribe({
      next: (response) => {
        this.prescriptions = response.content;
        this.createCharts();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading prescriptions for charts:', error);
        this.isLoading = false;
      }
    });
  }

  private createCharts() {
    this.createGenderChart();
    this.createAgeChart();
    this.createDailyChart();
  }

  private createGenderChart() {
    const genderData = this.getGenderDistribution();
    const ctx = document.getElementById('genderChart') as HTMLCanvasElement;

    if (ctx) {
      this.genderChart = new Chart(ctx, {
        type: 'pie',
        data: {
          labels: genderData.labels,
          datasets: [{
            data: genderData.data,
            backgroundColor: [
              '#FF6384',
              '#36A2EB',
              '#FFCE56'
            ],
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: 'Prescriptions by Gender'
            }
          }
        }
      });
    }
  }

  private createAgeChart() {
    const ageData = this.getAgeDistribution();
    const ctx = document.getElementById('ageChart') as HTMLCanvasElement;

    if (ctx) {
      this.ageChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ageData.labels,
          datasets: [{
            label: 'Number of Prescriptions',
            data: ageData.data,
            backgroundColor: '#4CAF50',
            borderColor: '#388E3C',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true
            }
          },
          plugins: {
            title: {
              display: true,
              text: 'Prescriptions by Age Group'
            }
          }
        }
      });
    }
  }

  private createDailyChart() {
    const dailyData = this.getDailyDistribution();
    const ctx = document.getElementById('dailyChart') as HTMLCanvasElement;

    if (ctx) {
      this.dailyChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: dailyData.labels,
          datasets: [{
            label: 'Prescriptions per Day',
            data: dailyData.data,
            backgroundColor: '#FF9800',
            borderColor: '#F57C00',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true
            }
          },
          plugins: {
            title: {
              display: true,
              text: 'Daily Prescription Count (Last 10 Days)'
            }
          }
        }
      });
    }
  }

  private getGenderDistribution(): ChartData {
    const genderCount: { [key: string]: number } = {};

    this.prescriptions.forEach(prescription => {
      const gender = prescription.patientGender;
      genderCount[gender] = (genderCount[gender] || 0) + 1;
    });

    return {
      labels: Object.keys(genderCount).map(gender =>
        gender === 'MALE' ? 'Male' : gender === 'FEMALE' ? 'Female' : 'Other'
      ),
      data: Object.values(genderCount)
    };
  }

  private getAgeDistribution(): ChartData {
    const ageGroups: { [key: string]: number } = {
      '0-18': 0,
      '19-35': 0,
      '36-50': 0,
      '51-65': 0,
      '66+': 0
    };

    this.prescriptions.forEach(prescription => {
      const age = prescription.patientAge;
      if (age <= 18) ageGroups['0-18']++;
      else if (age <= 35) ageGroups['19-35']++;
      else if (age <= 50) ageGroups['36-50']++;
      else if (age <= 65) ageGroups['51-65']++;
      else ageGroups['66+']++;
    });

    return {
      labels: Object.keys(ageGroups),
      data: Object.values(ageGroups)
    };
  }

  private getDailyDistribution(): ChartData {
    const dailyCount: { [key: string]: number } = {};
    const last10Days = this.getLast10Days();

    // Initialize with 0 for last 10 days
    last10Days.forEach(day => {
      dailyCount[day] = 0;
    });

    this.prescriptions.forEach(prescription => {
      const date = new Date(prescription.prescriptionDate);
      const dayKey = date.toISOString().split('T')[0]; // YYYY-MM-DD format
      if (dailyCount[dayKey] !== undefined) {
        dailyCount[dayKey]++;
      }
    });

    return {
      labels: last10Days.map(day => {
        const date = new Date(day);
        return date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric'
        });
      }),
      data: last10Days.map(day => dailyCount[day])
    };
  }

  private getLast10Days(): string[] {
    const days: string[] = [];
    const now = new Date();

    for (let i = 9; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);
      days.push(date.toISOString().split('T')[0]);
    }

    return days;
  }

  goBack() {
    this.router.navigate(['/prescriptions']);
  }
}
