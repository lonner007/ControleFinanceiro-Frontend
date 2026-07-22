import { Component, ViewChild } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { ContasTableComponent } from './contas-table/contas-table';
import { ContasFormComponent } from './contas-form/contas-form';
import { Dialog } from 'primeng/dialog';
import { Conta } from './models/contas-models';

@Component({
  selector: 'app-contas',
  standalone: true,
  imports: [
    ButtonModule,
    CommonModule,
    ContasTableComponent,
    ContasFormComponent,
    Dialog
  ],
  templateUrl: './contas.html',
  styleUrl: './contas.css',
})
export class ContasComponent {
  @ViewChild(ContasTableComponent) tabelaContas!: ContasTableComponent;

  public modalAberto: boolean = false;
  public contaSelecionada: Conta | null = null;
  public label: string = 'Criar Conta';

  criarNovaConta() {
    this.contaSelecionada = null;
    this.modalAberto = true;
    this.label = 'Criar Conta';
  }

  editarConta(conta: any) {
    this.label = 'Atualizar Conta';
    this.contaSelecionada = conta;
    this.modalAberto = true;
  }

  fecharModal() {
    this.modalAberto = false;
  }

  onSalvou() {
    this.modalAberto = false;
    // Recarrega a tabela após criar/editar/deletar
    setTimeout(() => this.tabelaContas?.obterContas(), 100);
  }
}
