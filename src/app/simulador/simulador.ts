import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { ChartModule } from 'primeng/chart';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TabsModule } from 'primeng/tabs';

@Component({
  selector: 'app-simulador',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonModule, InputNumberModule, SelectModule, TabsModule, TableModule, ChartModule],
  templateUrl: './simulador.html',
  styleUrl: './simulador.css',
})
export class SimuladorComponent {
  abaAtiva = 0;
  formJuros: FormGroup;
  formMeta: FormGroup;
  formFinanc: FormGroup;
  resultadoJuros: any = null;
  resultadoMeta: any = null;
  resultadoFinanc: any = null;
  tabelaJuros: any[] = [];
  tabelaFinanc: any[] = [];
  evolucaoData: any;
  evolucaoOptions: any;
  periodosOpcoes = [
    { label: 'Mensal', value: 'mensal' },
    { label: 'Anual', value: 'anual' },
  ];

  constructor(private fb: FormBuilder) {
    this.formJuros = this.fb.group({
      vlInicial: [0, [Validators.required, Validators.min(0)]],
      vlAporte: [500, [Validators.required, Validators.min(0)]],
      taxaJuros: [1, [Validators.required, Validators.min(0.001)]],
      periodo: ['mensal'],
      nrMeses: [24, [Validators.required, Validators.min(1)]],
    });

    this.formMeta = this.fb.group({
      vlMeta: [10000, [Validators.required, Validators.min(1)]],
      vlAporte: [500, [Validators.required, Validators.min(0.01)]],
      taxaJuros: [0.8, [Validators.required, Validators.min(0)]],
    });

    this.formFinanc = this.fb.group({
      vlFinanciado: [300000, [Validators.required, Validators.min(1)]],
      taxaJuros: [1, [Validators.required, Validators.min(0.001)]],
      nrParcelas: [360, [Validators.required, Validators.min(1)]],
    });

    this.configurarGrafico();
  }

  simularJuros(): void {
    if (this.formJuros.invalid) {
      this.formJuros.markAllAsTouched();
      return;
    }
    const { vlInicial, vlAporte, taxaJuros, periodo, nrMeses } = this.formJuros.value;
    const taxa = periodo === 'anual' ? Math.pow(1 + taxaJuros / 100, 1 / 12) - 1 : taxaJuros / 100;
    let saldo = vlInicial;
    let totalAportado = vlInicial;
    const tabela: any[] = [];
    const pontos = [{ mes: 0, saldo }];

    for (let i = 1; i <= nrMeses; i++) {
      const jurosMes = saldo * taxa;
      saldo = saldo + jurosMes + vlAporte;
      totalAportado += vlAporte;
      pontos.push({ mes: i, saldo });
      if (i <= 12 || i % 12 === 0 || i === nrMeses) {
        tabela.push({ mes: i, saldo, jurosMes, totalAportado, jurosAcum: saldo - totalAportado });
      }
    }

    this.tabelaJuros = tabela;
    this.resultadoJuros = {
      saldoFinal: saldo,
      totalAportado,
      jurosAcumulado: saldo - totalAportado,
      rentabilidade: ((saldo - totalAportado) / totalAportado) * 100,
    };
    this.atualizarGraficoEvolucao(pontos);
  }

  simularMeta(): void {
    if (this.formMeta.invalid) {
      this.formMeta.markAllAsTouched();
      return;
    }
    const { vlMeta, vlAporte, taxaJuros } = this.formMeta.value;
    const taxa = taxaJuros / 100;
    let saldo = 0;
    let meses = 0;
    const pontos = [{ mes: 0, saldo }];

    while (saldo < vlMeta && meses < 1200) {
      saldo = saldo * (1 + taxa) + vlAporte;
      meses++;
      pontos.push({ mes: meses, saldo });
    }

    const totalAportado = vlAporte * meses;
    this.resultadoMeta = {
      meses,
      anos: Math.floor(meses / 12),
      mesesRestantes: meses % 12,
      totalAportado,
      jurosGanhos: saldo - totalAportado,
    };
    this.atualizarGraficoEvolucao(pontos);
  }

  simularFinanciamento(): void {
    if (this.formFinanc.invalid) {
      this.formFinanc.markAllAsTouched();
      return;
    }
    const { vlFinanciado, taxaJuros, nrParcelas } = this.formFinanc.value;
    const taxa = taxaJuros / 100;
    const parcela = (vlFinanciado * (taxa * Math.pow(1 + taxa, nrParcelas))) / (Math.pow(1 + taxa, nrParcelas) - 1);
    const totalPago = parcela * nrParcelas;
    let saldo = vlFinanciado;
    const tabela: any[] = [];
    const pontos = [{ mes: 0, saldo }];

    for (let i = 1; i <= Math.min(nrParcelas, 48); i++) {
      const juros = saldo * taxa;
      const amortizacao = parcela - juros;
      saldo -= amortizacao;
      tabela.push({ parcela: i, vlParcela: parcela, juros, amortizacao, saldo: Math.max(saldo, 0) });
      pontos.push({ mes: i, saldo: Math.max(saldo, 0) });
    }

    this.resultadoFinanc = {
      parcela,
      totalPago,
      totalJuros: totalPago - vlFinanciado,
    };
    this.tabelaFinanc = tabela;
    this.atualizarGraficoEvolucao(pontos);
  }

  fmt(v: number) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
  }

  fmtPct(v: number) {
    return `${v.toFixed(2)}%`;
  }

  private configurarGrafico() {
    this.evolucaoOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: '#475569' } },
      },
      scales: {
        x: { ticks: { color: '#64748b' }, grid: { color: 'rgba(148,163,184,0.15)' } },
        y: { ticks: { color: '#64748b' }, grid: { color: 'rgba(148,163,184,0.15)' } },
      },
    };
  }

  private atualizarGraficoEvolucao(pontos: { mes: number; saldo: number }[]) {
    this.evolucaoData = {
      labels: pontos.map((p) => (p.mes === 0 ? 'Início' : `M${p.mes}`)),
      datasets: [
        {
          label: 'Patrimônio',
          data: pontos.map((p) => Number(p.saldo.toFixed(2))),
          borderColor: '#2563eb',
          backgroundColor: 'rgba(37, 99, 235, 0.18)',
          fill: true,
          tension: 0.35,
        },
      ],
    };
  }
}
