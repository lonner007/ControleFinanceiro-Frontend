import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

// PrimeNG
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { Textarea } from 'primeng/textarea';
import { ProgressBar } from 'primeng/progressbar';
import { MessageService, ConfirmationService } from 'primeng/api';
import { DatePicker } from 'primeng/datepicker';

import { MetaService } from './metas-service';
import { Meta } from './models/metas-models';

@Component({
  selector: 'app-metas',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TableModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    InputNumberModule,
    TagModule,
    TooltipModule,
    Textarea,
    ProgressBar,
    DatePicker,
  ],
  templateUrl: './metas.html',
  styleUrls: ['./metas.css'],
})
export class MetasComponent implements OnInit {

  metas: Meta[] = [];
  carregando = false;
  dialogVisivel = false;
  modoEdicao = false;
  cdMetaSelecionada: number | null = null;

  form!: FormGroup;

  constructor(
    private metaService: MetaService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.inicializarForm();
    this.carregarMetas();
  }

  inicializarForm(): void {
    this.form = this.fb.group({
      nmMeta: ['', [Validators.required, Validators.minLength(2)]],
      dsMeta: [''],
      vlAlvo: [null, [Validators.required, Validators.min(0.01)]],
      vlAtual: [0],
      dtPrazo: [null, Validators.required],
      ativo: [true],
    });
  }

  carregarMetas(): void {
    this.carregando = true;
    this.metaService.obterMetas().subscribe({
      next: (res) => {
        this.metas = res.dados ?? [];
        this.carregando = false;
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Não foi possível carregar as metas.',
        });
        this.carregando = false;
      },
    });
  }

  abrirDialogNovo(): void {
    this.modoEdicao = false;
    this.cdMetaSelecionada = null;
    this.form.reset({ ativo: true, vlAtual: 0 });
    this.dialogVisivel = true;
  }

  abrirDialogEdicao(meta: Meta): void {
    this.modoEdicao = true;
    this.cdMetaSelecionada = meta.cdMeta!;
    this.form.patchValue({
      ...meta,
      dtPrazo: meta.dtPrazo ? new Date(meta.dtPrazo) : null,
    });
    this.dialogVisivel = true;
  }

  fecharDialog(): void {
    this.dialogVisivel = false;
    this.form.reset();
  }

  salvar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const dados: Meta = {
      ...this.form.value,
      dtPrazo: this.form.value.dtPrazo instanceof Date
        ? this.form.value.dtPrazo.toISOString()
        : this.form.value.dtPrazo,
    };

    if (this.modoEdicao && this.cdMetaSelecionada !== null) {
      this.metaService.atualizarMeta(this.cdMetaSelecionada, dados).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Sucesso',
            detail: 'Meta atualizada com sucesso!',
          });
          this.fecharDialog();
          this.carregarMetas();
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Não foi possível atualizar a meta.',
          });
        },
      });
    } else {
      this.metaService.criarMeta(dados).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Sucesso',
            detail: 'Meta criada com sucesso!',
          });
          this.fecharDialog();
          this.carregarMetas();
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Não foi possível criar a meta.',
          });
        },
      });
    }
  }

  confirmarDelecao(meta: Meta): void {
    this.confirmationService.confirm({
      message: `Deseja excluir a meta <strong>${meta.nmMeta}</strong>?`,
      header: 'Confirmar exclusão',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim, excluir',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.metaService.deletarMeta(meta.cdMeta!).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Sucesso',
              detail: 'Meta excluída com sucesso!',
            });
            this.carregarMetas();
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Erro',
              detail: 'Não foi possível excluir a meta.',
            });
          },
        });
      },
    });
  }

  getPercentual(meta: Meta): number {
    if (!meta.vlAlvo || meta.vlAlvo === 0) return 0;
    return Math.min(Math.round((meta.vlAtual / meta.vlAlvo) * 100), 100);
  }

  getMetasConcluidas(): number {
    return this.metas.filter(m => this.getPercentual(m) >= 100).length;
  }

  getValorRestante(meta: Meta): number {
    return Math.max(meta.vlAlvo - meta.vlAtual, 0);
  }

  getStatusSeverity(meta: Meta): 'success' | 'warn' | 'danger' | 'info' {
    const pct = this.getPercentual(meta);
    if (pct >= 100) return 'success';
    if (pct >= 60) return 'info';
    if (pct >= 30) return 'warn';
    return 'danger';
  }

  getStatusLabel(meta: Meta): string {
    const pct = this.getPercentual(meta);
    if (pct >= 100) return 'Concluída';
    if (pct >= 60) return 'Em progresso';
    if (pct >= 30) return 'Iniciada';
    return 'No início';
  }

  getDiasRestantes(meta: Meta): number {
    if (!meta.dtPrazo) return 0;
    const hoje = new Date();
    const prazo = new Date(meta.dtPrazo);
    const diff = prazo.getTime() - hoje.getTime();
    return Math.max(Math.ceil(diff / (1000 * 60 * 60 * 24)), 0);
  }

  campoInvalido(campo: string): boolean {
    const control = this.form.get(campo);
    return !!(control?.invalid && control?.touched);
  }
}
