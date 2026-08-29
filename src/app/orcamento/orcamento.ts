import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { Select } from 'primeng/select';
import { ProgressBar } from 'primeng/progressbar';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService, ConfirmationService } from 'primeng/api';
import { OrcamentoService } from './orcamento-service';
import { CategoriaService } from '../categorias/categorias-service';
import { Orcamento } from './models/orcamento-models';

@Component({
  selector: 'app-orcamento',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonModule, DialogModule, InputNumberModule, Select, ProgressBar, TagModule, TooltipModule],
  templateUrl: './orcamento.html',
  styleUrl: './orcamento.css',
})
export class OrcamentoComponent implements OnInit {
  orcamentos: Orcamento[] = [];
  categorias: { label: string; value: number }[] = [];
  dialogVisivel = false;
  form!: FormGroup;
  mes = new Date().getMonth() + 1;
  ano = new Date().getFullYear();

  constructor(
    private orcamentoService: OrcamentoService,
    private categoriaService: CategoriaService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({ cdCategoria: [null, Validators.required], vlLimite: [null, [Validators.required, Validators.min(0.01)]] });
    this.categoriaService.obterCategorias().subscribe({ next: (r) => { this.categorias = (r.dados ?? []).filter(c => c.tpCategoria === 'Despesa').map(c => ({ label: c.nmCategoria, value: c.cdCategoria! })); } });
    this.carregar();
  }

  carregar() { this.orcamentoService.obterOrcamentos(this.mes, this.ano).subscribe({ next: (r) => { this.orcamentos = r.dados ?? []; } }); }

  salvar() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.orcamentoService.salvarOrcamento({ ...this.form.value, nrMes: this.mes, nrAno: this.ano }).subscribe({
      next: () => { this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Orçamento salvo!' }); this.dialogVisivel = false; this.form.reset(); this.carregar(); },
      error: () => this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao salvar.' })
    });
  }

  confirmarDelecao(orc: Orcamento) {
    this.confirmationService.confirm({
      message: `Excluir orçamento de <strong>${orc.nmCategoria}</strong>?`, header: 'Confirmar', icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim', rejectLabel: 'Cancelar', acceptButtonStyleClass: 'p-button-danger',
      accept: () => { this.orcamentoService.deletarOrcamento(orc.cdOrcamento!).subscribe({ next: () => { this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Orçamento excluído!' }); this.carregar(); } }); }
    });
  }

  navegarMes(dir: number) {
    this.mes += dir;
    if (this.mes > 12) { this.mes = 1; this.ano++; }
    if (this.mes < 1) { this.mes = 12; this.ano--; }
    this.carregar();
  }

  fecharDialog() { 
    this.dialogVisivel = false; this.form.reset();
   }

  getMesNome() { return new Date(this.ano, this.mes - 1, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }); }
  getSeverity(pct: number): 'success' | 'warn' | 'danger' { return pct < 70 ? 'success' : pct < 90 ? 'warn' : 'danger'; }
  campoInvalido(c: string) { const ctrl = this.form.get(c); return !!(ctrl?.invalid && ctrl?.touched); }
}
