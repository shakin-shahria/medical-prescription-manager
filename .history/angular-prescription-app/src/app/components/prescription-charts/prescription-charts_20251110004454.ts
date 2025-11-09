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
    this.prescriptionService.getAnalytics().subscribe({
      next: (data) => {
        this.analyticsData = data;
        this.totalPrescriptions = data.totalPrescriptions;
        this.todayPrescriptions = data.todayPrescriptions;
        this.thisWeekPrescriptions = data.thisWeekPrescriptions;
        this.isLoading = false;
        // Create chart after view is initialized and data is loaded
        setTimeout(() => this.createDailyChart(), 0);
      },
      error: (error) => {
        console.error('Error loading analytics:', error);
        this.isLoading = false;
      }
    });
  }

  private createDailyChart() {
    if (!this.analyticsData) return;

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

  private getDailyDistribution(): ChartData {
    if (!this.analyticsData) {
      return { labels: [], data: [] };
    }

    const last7Days = this.getLast7Days();

    return {
      labels: last7Days.map(day => {
        const date = new Date(day);
        return date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric'
        });
      }),
      data: last7Days.map(day => this.analyticsData!.dailyBreakdown[day] || 0)
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
