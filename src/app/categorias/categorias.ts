import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { Textarea } from 'primeng/textarea';
import { MessageService, ConfirmationService } from 'primeng/api';

import { CategoriaService } from './categorias-service';
import { Categoria, TipoCategoria } from './models/categorias-models';

@Component({
  selector: 'app-categorias',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TableModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    Select,
    TagModule,
    TooltipModule,
    Textarea,
  ],
  templateUrl: './categorias.html',
  styleUrl: './categorias.css',
})
export class CategoriasComponent implements OnInit {

  categorias: Categoria[] = [];
  carregando = false;
  dialogVisivel = false;
  modoEdicao = false;
  cdCategoriaSelecionada: number | null = null;

  form!: FormGroup;

  tiposCategoria = [
    { label: 'Receita', value: 'Receita' },
    { label: 'Despesa', value: 'Despesa' },
  ];

  constructor(
    private categoriaService: CategoriaService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.inicializarForm();
    this.carregarCategorias();
  }

  inicializarForm(): void {
    this.form = this.fb.group({
      nmCategoria: ['', [Validators.required, Validators.minLength(2)]],
      dsCategoria: [''],
      tpCategoria: [null, Validators.required],
      icone: [''],
      cor: ['#6366f1'],
      ativo: [true],
    });
  }

  carregarCategorias(): void {
    this.carregando = true;
    this.categoriaService.obterCategorias().subscribe({
      next: (res) => {
        this.categorias = res.dados ?? [];
        this.carregando = false;
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Não foi possível carregar as categorias.' });
        this.carregando = false;
      },
    });
  }

  abrirDialogNovo(): void {
    this.modoEdicao = false;
    this.cdCategoriaSelecionada = null;
    this.form.reset({ ativo: true, cor: '#6366f1' });
    this.dialogVisivel = true;
  }

  abrirDialogEdicao(categoria: Categoria): void {
    this.modoEdicao = true;
    this.cdCategoriaSelecionada = categoria.cdCategoria!;
    this.form.patchValue(categoria);
    this.dialogVisivel = true;
  }

  fecharDialog(): void {
    this.dialogVisivel = false;
    this.form.reset();
  }

  salvar(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const dados: Categoria = this.form.value;

    if (this.modoEdicao && this.cdCategoriaSelecionada !== null) {
      this.categoriaService.atualizarCategoria(this.cdCategoriaSelecionada, dados).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Categoria atualizada com sucesso!' });
          this.fecharDialog();
          this.carregarCategorias();
        },
        error: () => this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Não foi possível atualizar a categoria.' }),
      });
    } else {
      this.categoriaService.criarCategoria(dados).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Categoria criada com sucesso!' });
          this.fecharDialog();
          this.carregarCategorias();
        },
        error: () => this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Não foi possível criar a categoria.' }),
      });
    }
  }

  confirmarDelecao(categoria: Categoria): void {
    this.confirmationService.confirm({
      message: `Deseja excluir a categoria <strong>${categoria.nmCategoria}</strong>?`,
      header: 'Confirmar exclusão',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim, excluir',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.categoriaService.deletarCategoria(categoria.cdCategoria!).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Categoria excluída com sucesso!' });
            this.carregarCategorias();
          },
          error: () => this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Não foi possível excluir a categoria.' }),
        });
      },
    });
  }

  getSeverity(tipo: TipoCategoria): 'success' | 'danger' {
    return tipo === 'Receita' ? 'success' : 'danger';
  }

  campoInvalido(campo: string): boolean {
    const control = this.form.get(campo);
    return !!(control?.invalid && control?.touched);
  }
}
