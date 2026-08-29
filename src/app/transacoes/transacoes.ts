import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { Select } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { Textarea } from 'primeng/textarea';
import { DatePicker } from 'primeng/datepicker';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { MessageService, ConfirmationService } from 'primeng/api';
import { TransacaoService } from './transacoes-service';
import { Transacao, TipoTransacao } from './models/transacoes-models';
import { ContaService } from '../contas/contas-service';
import { CategoriaService } from '../categorias/categorias-service';

@Component({
  selector: 'app-transacoes',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, TableModule, ButtonModule, DialogModule,
    InputTextModule, InputNumberModule, Select, TagModule, TooltipModule,
    Textarea, DatePicker, ToggleSwitchModule,
  ],
  templateUrl: './transacoes.html',
  styleUrl: './transacoes.css',
})
export class TransacoesComponent implements OnInit {
  transacoes: Transacao[] = [];
  carregando = false;
  dialogVisivel = false;
  modoEdicao = false;
  cdTransacaoSelecionada: number | null = null;
  form!: FormGroup;

  tiposTransacao = [
    { label: 'Receita', value: 'Receita' },
    { label: 'Despesa', value: 'Despesa' },
    { label: 'Transferência', value: 'Transferencia' },
  ];

  contas: { label: string; value: number }[] = [];
  categorias: { label: string; value: number }[] = [];

  constructor(
    private transacaoService: TransacaoService,
    private contaService: ContaService,
    private categoriaService: CategoriaService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.inicializarForm();
    this.carregarTransacoes();
    this.carregarContas();
    this.carregarCategorias();
  }

  inicializarForm(): void {
    this.form = this.fb.group({
      tpTransacao: [null, Validators.required],
      cdConta: [null, Validators.required],
      cdContaDestino: [null],
      cdCategoria: [null],
      vlTransacao: [null, [Validators.required, Validators.min(0.01)]],
      dtTransacao: [null, Validators.required],
      dsTransacao: [''],
      parcelado: [false],
      nrParcelas: [2],
    });

    this.form.get('tpTransacao')?.valueChanges.subscribe((tipo: TipoTransacao) => {
      const cdContaDestino = this.form.get('cdContaDestino');
      const cdCategoria = this.form.get('cdCategoria');
      if (tipo === 'Transferencia') {
        cdContaDestino?.setValidators(Validators.required);
        cdCategoria?.clearValidators(); cdCategoria?.setValue(null);
        this.form.get('parcelado')?.setValue(false);
      } else {
        cdContaDestino?.clearValidators(); cdContaDestino?.setValue(null);
        cdCategoria?.setValidators(Validators.required);
      }
      cdContaDestino?.updateValueAndValidity();
      cdCategoria?.updateValueAndValidity();
    });
  }

  carregarTransacoes(): void {
    this.carregando = true;
    this.transacaoService.obterTransacoes().subscribe({
      next: (res) => { this.transacoes = res.dados ?? []; this.carregando = false; },
      error: () => { this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Não foi possível carregar as transações.' }); this.carregando = false; },
    });
  }

  carregarContas(): void {
    this.contaService.obterContas().subscribe({ next: (res: any) => { this.contas = (res.dados ?? []).map((c: any) => ({ label: c.nmConta, value: c.cdConta })); } });
  }

  carregarCategorias(): void {
    this.categoriaService.obterCategorias().subscribe({ next: (res: any) => { this.categorias = (res.dados ?? []).map((c: any) => ({ label: c.nmCategoria, value: c.cdCategoria })); } });
  }

  get tipoSelecionado(): TipoTransacao | null { return this.form.get('tpTransacao')?.value; }
  get isTransferencia(): boolean { return this.tipoSelecionado === 'Transferencia'; }
  get isParcelado(): boolean { return this.form.get('parcelado')?.value === true; }

  abrirDialogNovo(): void { this.modoEdicao = false; this.cdTransacaoSelecionada = null; this.form.reset({ parcelado: false, nrParcelas: 2 }); this.dialogVisivel = true; }

  abrirDialogEdicao(transacao: Transacao): void {
    this.modoEdicao = true;
    this.cdTransacaoSelecionada = transacao.cdTransacao!;
    this.form.patchValue({ ...transacao, dtTransacao: transacao.dtTransacao ? new Date(transacao.dtTransacao) : null });
    this.dialogVisivel = true;
  }

  fecharDialog(): void { this.dialogVisivel = false; this.form.reset(); }

  salvar(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    if (!this.isParcelado) { this.form.get('nrParcelas')?.setValue(null); }
    const dados: Transacao = { ...this.form.value, dtTransacao: this.form.value.dtTransacao instanceof Date ? this.form.value.dtTransacao.toISOString() : this.form.value.dtTransacao };

    if (this.modoEdicao && this.cdTransacaoSelecionada !== null) {
      this.transacaoService.atualizarTransacao(this.cdTransacaoSelecionada, dados).subscribe({
        next: () => { this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Transação atualizada!' }); this.fecharDialog(); this.carregarTransacoes(); },
        error: () => this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Não foi possível atualizar.' }),
      });
    } else {
      this.transacaoService.criarTransacao(dados).subscribe({
        next: () => { this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: dados.parcelado ? `${dados.nrParcelas} parcelas criadas!` : 'Transação criada!' }); this.fecharDialog(); this.carregarTransacoes(); },
        error: () => this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Não foi possível criar.' }),
      });
    }
  }

  confirmarDelecao(transacao: Transacao): void {
    this.confirmationService.confirm({
      message: `Deseja excluir esta transação de <strong>${this.formatarMoeda(transacao.vlTransacao)}</strong>?`,
      header: 'Confirmar exclusão', icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim, excluir', rejectLabel: 'Cancelar', acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.transacaoService.deletarTransacao(transacao.cdTransacao!).subscribe({
          next: () => { this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Transação excluída!' }); this.carregarTransacoes(); },
          error: () => this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Não foi possível excluir.' }),
        });
      },
    });
  }

  getTipoSeverity(tipo: TipoTransacao): 'success' | 'danger' | 'info' {
    return tipo === 'Receita' ? 'success' : tipo === 'Despesa' ? 'danger' : 'info';
  }
  getTipoLabel(tipo: TipoTransacao): string { return tipo === 'Transferencia' ? 'Transferência' : tipo; }
  formatarMoeda(valor: number): string { return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor); }
  getTotalReceitas(): number { return this.transacoes.filter(t => t.tpTransacao === 'Receita').reduce((s, t) => s + t.vlTransacao, 0); }
  getTotalDespesas(): number { return this.transacoes.filter(t => t.tpTransacao === 'Despesa').reduce((s, t) => s + t.vlTransacao, 0); }
  getSaldo(): number { return this.getTotalReceitas() - this.getTotalDespesas(); }
  campoInvalido(campo: string): boolean { const c = this.form.get(campo); return !!(c?.invalid && c?.touched); }
}
