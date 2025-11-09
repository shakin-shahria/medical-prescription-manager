import { Component, inject, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import { PrescriptionService, AnalyticsData } from '../../services/prescription';
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
export class PrescriptionCharts implements OnInit {
  private prescriptionService = inject(PrescriptionService);
  private router = inject(Router);

  @ViewChild('dailyChartCanvas', { static: false }) dailyChartCanvas!: ElementRef<HTMLCanvasElement>;

  isLoading = false;
  analyticsData: AnalyticsData | null = null;

  // Simple metrics
  totalPrescriptions = 0;
  todayPrescriptions = 0;
  thisWeekPrescriptions = 0;

  ngOnInit() {
    this.loadPrescriptions();
  }

  ngOnDestroy() {
    // Clean up chart
    if (this.dailyChart) {
      this.dailyChart.destroy();
    }
  }

  private loadPrescriptions() {
    this.isLoading = true;
    this.prescriptionService.getPrescriptions(0, 1000).subscribe({
      next: (response) => {
        this.prescriptions = response.content;
        this.calculateMetrics();
        this.isLoading = false;
        // Create chart after view is initialized and data is loaded
        setTimeout(() => this.createDailyChart(), 0);
      },
      error: (error) => {
        console.error('Error loading prescriptions for charts:', error);
        this.isLoading = false;
      }
    });
  }

  private calculateMetrics() {
    this.totalPrescriptions = this.prescriptions.length;

    const today = new Date();
    const todayString = today.toISOString().split('T')[0];

    const weekAgo = new Date();
    weekAgo.setDate(today.getDate() - 7);

    this.todayPrescriptions = this.prescriptions.filter(p => {
      const prescriptionDate = new Date(p.prescriptionDate).toISOString().split('T')[0];
      return prescriptionDate === todayString;
    }).length;

    this.thisWeekPrescriptions = this.prescriptions.filter(p => {
      const prescriptionDate = new Date(p.prescriptionDate);
      return prescriptionDate >= weekAgo;
    }).length;
  }

  private createDailyChart() {
    const dailyData = this.getDailyDistribution();
    const ctx = this.dailyChartCanvas?.nativeElement;

    if (ctx) {
      this.dailyChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: dailyData.labels,
          datasets: [{
            label: 'Prescriptions',
            data: dailyData.data,
            backgroundColor: '#2196F3',
            borderColor: '#1976D2',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                stepSize: 1
              }
            }
          },
          plugins: {
            title: {
              display: true,
              text: 'Daily Prescriptions (Last 7 Days)'
            },
            legend: {
              display: false
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
    const last7Days = this.getLast7Days();

    // Initialize with 0 for last 7 days
    last7Days.forEach(day => {
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
      labels: last7Days.map(day => {
        const date = new Date(day);
        return date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric'
        });
      }),
      data: last7Days.map(day => dailyCount[day])
    };
  }

  private getLast7Days(): string[] {
    const days: string[] = [];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
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
