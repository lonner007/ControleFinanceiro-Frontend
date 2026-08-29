import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ButtonModule } from 'primeng/button';
import { ChartModule } from 'primeng/chart';
import { ProgressBar } from 'primeng/progressbar';
import { TagModule } from 'primeng/tag';
import { MetaService } from '../metas/metas-service';
import { Meta } from '../metas/models/metas-models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, ButtonModule, ChartModule, ProgressBar, TagModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class DashboardComponent implements OnInit {
  resumo: any = null;
  orcamentos: any[] = [];
  metas: Meta[] = [];
  carregando = true;
  mes = new Date().getMonth() + 1;
  ano = new Date().getFullYear();
  private api = 'http://localhost:5261/Api';
  graficoGanhosDespesas: any;
  graficoGanhosDespesasOptions: any;
  graficoMetas: any;
  graficoMetasOptions: any;
  graficoStatusMetas: any;
  graficoStatusMetasOptions: any;

  constructor(private http: HttpClient, private metaService: MetaService) {
    this.configurarGraficos();
  }

  ngOnInit() { this.carregar(); }

  carregar() {
    this.carregando = true;
    this.http.get(`${this.api}/Dashboard?mes=${this.mes}&ano=${this.ano}`).subscribe({
      next: (r: any) => {
        this.resumo = r;
        this.atualizarGraficos();
        this.carregando = false;
      },
      error: () => {
        this.carregando = false;
      }
    });
    this.http.get<any>(`${this.api}/Orcamentos?mes=${this.mes}&ano=${this.ano}`).subscribe({
      next: (r) => { this.orcamentos = r.dados ?? []; }
    });
    this.metaService.obterMetas().subscribe({
      next: (r) => {
        this.metas = r.dados ?? [];
        this.atualizarGraficos();
      }
    });
  }

  navegarMes(dir: number) {
    this.mes += dir;
    if (this.mes > 12) { this.mes = 1; this.ano++; }
    if (this.mes < 1) { this.mes = 12; this.ano--; }
    this.carregar();
  }

  getMesNome() {
    return new Date(this.ano, this.mes - 1, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  }

  getSeverity(pct: number): 'success' | 'warn' | 'danger' {
    return pct < 70 ? 'success' : pct < 90 ? 'warn' : 'danger';
  }

  getStatusSeverity(meta: Meta): 'success' | 'warn' | 'danger' {
    return this.getSeverity(this.getPercentual(meta));
  }

  getPercentual(meta: Meta): number {
    if (!meta.vlAlvo || meta.vlAlvo === 0) return 0;
    return Math.min(Math.round((meta.vlAtual / meta.vlAlvo) * 100), 100);
  }

  getStatusMeta(meta: Meta): 'concluida' | 'andamento' | 'nao_iniciada' {
    const pct = this.getPercentual(meta);
    if (pct >= 100) return 'concluida';
    if (pct > 0) return 'andamento';
    return 'nao_iniciada';
  }

  private configurarGraficos() {
    this.graficoGanhosDespesasOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { labels: { color: '#475569' } } },
    };

    this.graficoMetasOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { labels: { color: '#475569' } } },
      scales: {
        x: { ticks: { color: '#64748b' }, grid: { color: 'rgba(148,163,184,0.15)' } },
        y: { ticks: { color: '#64748b' }, grid: { color: 'rgba(148,163,184,0.15)' } },
      },
    };

    this.graficoStatusMetasOptions = {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '68%',
      plugins: { legend: { position: 'bottom', labels: { color: '#475569' } } },
    };
  }

  private atualizarGraficos() {
    const ganhos = this.resumo?.totalReceitas ?? 0;
    const despesas = this.resumo?.totalDespesas ?? 0;

    this.graficoGanhosDespesas = {
      labels: ['Ganhos', 'Despesas'],
      datasets: [
        {
          label: 'Valor',
          data: [ganhos, despesas],
          backgroundColor: ['#16a34a', '#ef4444'],
          borderRadius: 12,
        },
      ],
    };

    const metasOrdenadas = [...(this.metas ?? [])].sort((a, b) => (b.vlAtual / (b.vlAlvo || 1)) - (a.vlAtual / (a.vlAlvo || 1)));
    this.graficoMetas = {
      labels: metasOrdenadas.map((m) => m.nmMeta),
      datasets: [
        {
          label: 'Atual',
          data: metasOrdenadas.map((m) => m.vlAtual),
          backgroundColor: '#2563eb',
        },
        {
          label: 'Objetivo',
          data: metasOrdenadas.map((m) => m.vlAlvo),
          backgroundColor: '#cbd5e1',
        },
      ],
    };

    const concluidas = this.metas.filter((m) => this.getStatusMeta(m) === 'concluida').length;
    const andamento = this.metas.filter((m) => this.getStatusMeta(m) === 'andamento').length;
    const naoIniciadas = this.metas.filter((m) => this.getStatusMeta(m) === 'nao_iniciada').length;

    this.graficoStatusMetas = {
      labels: ['Concluídas', 'Em andamento', 'Não iniciadas'],
      datasets: [
        {
          data: [concluidas, andamento, naoIniciadas],
          backgroundColor: ['#16a34a', '#f59e0b', '#94a3b8'],
          borderWidth: 0,
        },
      ],
    };
  }
}
