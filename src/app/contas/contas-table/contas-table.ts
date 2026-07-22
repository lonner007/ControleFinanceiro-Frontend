import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { TooltipModule } from 'primeng/tooltip';
import { ContaService } from '../contas-service';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-contas-table',
  standalone: true,
  imports: [ButtonModule, TableModule, CommonModule, TooltipModule, TagModule],
  templateUrl: './contas-table.html',
  styleUrl: './contas-table.css',
})
export class ContasTableComponent implements OnInit {

  constructor(private contaService: ContaService) {}

  @Output() atualizarConta = new EventEmitter<any>();

  contas: any[] = [];
  colunas: any[] = [
    { field: 'nmConta', header: 'Nome' },
    { field: 'vlSaldoAtual', header: 'Saldo' },
    { field: 'cdTipoConta', header: 'Tipo' },
  ];

  tipoContaMap: Record<number, string> = {
    1: 'Carteira',
    2: 'Conta Corrente',
    3: 'Poupança',
    4: 'Cartão de Crédito',
  };

  ngOnInit() {
    this.obterContas();
  }

  public obterContas() {
    this.contaService.obterContas().subscribe({
      next: (res) => {
        this.contas = res.dados ?? [];
      },
      error: (err) => {
        console.error('Erro ao carregar contas', err);
      },
    });
  }

  public atualizaConta(conta: any) {
    this.atualizarConta.emit(conta);
  }

  getTipoLabel(cdTipo: number): string {
    return this.tipoContaMap[cdTipo] ?? 'Desconhecido';
  }

  formatarSaldo(valor: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor ?? 0);
  }
}
