import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { DashboardOverview } from '../../models/interfaces';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  overview: DashboardOverview | null = null;

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.apiService.getDashboardOverview().subscribe({
      next: (data) => this.overview = data,
      error: (err) => console.error('Erro ao carregar analytics:', err)
    });
  }

  reloadSeed() {
    this.apiService.triggerSeed().subscribe(() => {
      this.loadData();
      alert('Banco de dados semeado com sucesso!');
    });
  }
}
