import { Component, EventEmitter, Input, Output, ViewChild, ElementRef, AfterViewInit, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ContaService } from '../contas-service';

// PrimeNG
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { ConfirmationService, MessageService } from 'primeng/api';

@Component({
  selector: 'app-contas-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    InputNumberModule,
    ButtonModule,
    SelectModule,
  ],
  templateUrl: './contas-form.html',
  styleUrl: './contas-form.css',
})
export class ContasFormComponent implements AfterViewInit, OnInit, OnChanges {
  @Output() salvou = new EventEmitter<void>();
  @Input() conta: any;
  @ViewChild('nomeInput') nomeInput?: ElementRef;

  form: FormGroup;
  isSubmitting = false;
  focusedField: string | null = null;

  tiposConta = [
    { label: 'Carteira', value: 1 },
    { label: 'Conta Corrente', value: 2 },
    { label: 'Poupança', value: 3 },
    { label: 'Cartão de Crédito', value: 4 },
  ];

  public submitted: boolean = false;

  constructor(
    private fb: FormBuilder,
    private contaService: ContaService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {
    this.form = this.fb.group({
      nmConta: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(100),
          this.trimValidator.bind(this),
        ],
      ],
      cdTipoConta: [null, Validators.required],
      vlSaldoInicial: [null, [Validators.required, this.balanceValidator.bind(this)]],
    });
  }

  ngOnInit() {
    // Se houver uma conta, carrega os dados dela no formulário
    if (this.conta && this.conta.cdConta) {
      this.carregarConta();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    // Se a conta mudar, recarrega os dados
    if (changes['conta'] && !changes['conta'].firstChange) {
      if (this.conta && this.conta.cdConta) {
        this.carregarConta();
      }
    }
  }

  ngAfterViewInit() {
  }

  // Validador customizado para garantir que o nome da conta não seja apenas espaços em branco
  private trimValidator(
    control: AbstractControl,
  ): ValidationErrors | null {
    if (!control.value) {
      return null;
    }
    const trimmed = control.value.trim();
    return trimmed.length === 0 ? { whitespaceOnly: true } : null;
  }

  // Validador customizado para o valor do saldo
  private balanceValidator(
    control: AbstractControl,
  ): ValidationErrors | null {
    if (control.value === null || control.value === undefined) {
      return null;
    }
    const value = Number(control.value);
    if (isNaN(value)) {
      return { invalidNumber: true };
    }
    if (value < -999999999 || value > 999999999) {
      return { rangeExceeded: true };
    }
    return null;
  }

  // Carrega os dados da conta no formulário
  private carregarConta() {
    if (this.conta) {
      this.form.patchValue({
        nmConta: this.conta.nmConta || '',
        cdTipoConta: this.conta.cdContaTipo || null,
        vlSaldoInicial: this.conta.vlSaldoAtual || 0,
      });
      this.form.markAsPristine();
      this.form.markAsUntouched();
      this.submitted = false;
    }
  }

  // Método auxiliar para obter mensagens de erro de um campo
  getFieldError(fieldName: string): string {
    const control = this.form.get(fieldName);
    if (!control || !control.errors || !control.touched && !this.submitted) {
      return '';
    }

    const errors = control.errors;
    if (errors['required']) {
      return 'Este campo é obrigatório';
    }
    if (errors['minlength']) {
      return `Mínimo de ${errors['minlength'].requiredLength} caracteres`;
    }
    if (errors['maxlength']) {
      return `Máximo de ${errors['maxlength'].requiredLength} caracteres`;
    }
    if (errors['whitespaceOnly']) {
      return 'Nome não pode conter apenas espaços';
    }
    if (errors['invalidNumber']) {
      return 'Valor deve ser um número válido';
    }
    if (errors['rangeExceeded']) {
      return 'Valor fora do intervalo permitido';
    }
    return 'Este campo é inválido';
  }

  // Método auxiliar para verificar se o campo é inválido e foi tocado
  isFieldInvalid(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return !!(field && field.invalid && field.touched || this.submitted);
  }

  // Define o campo em foco para feedback visual
  setFocusedField(fieldName: string | null) {
    this.focusedField = fieldName;
  }

  // Verifica se está em modo de edição (conta existente)
  get isEditMode(): boolean {
    return !!this.conta && !!this.conta.cdConta;
  }

  salvarOuAtualizar() {
    this.submitted = true;
    if (this.form.invalid) {
      // Marca todos os campos como tocados para exibir todos os erros
      Object.keys(this.form.controls).forEach(key => {
        this.form.get(key)?.markAsTouched();
      });
      this.messageService.add({
        severity: 'warn',
        summary: 'Validação',
        detail: 'Por favor, preencha todos os campos corretamente',
      });
      return;
    }

    this.isSubmitting = true;

    // Remove espaços do nome da conta antes de enviar
    const formValue = {
      ...this.form.value,
      nmConta: this.form.get('nmConta')?.value.trim(),
    };

    // Se está em modo edição, faz atualização; caso contrário, cria nova conta
    if (this.isEditMode) {
      this.contaService.atualizarConta(this.conta.cdConta, formValue).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Sucesso',
            detail: 'Conta atualizada com sucesso',
            life: 3000,
          });

          this.salvou.emit();
          this.resetForm();
          this.isSubmitting = false;
        },
        error: (error: any) => {
          console.error('Erro ao atualizar conta:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: error?.error?.message || 'Erro ao atualizar conta',
            life: 5000,
          });
          this.isSubmitting = false;
        },
      });
    } else {
      this.contaService.criarConta(formValue).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Sucesso',
            detail: 'Conta criada com sucesso',
            life: 3000,
          });

          this.salvou.emit();
          this.resetForm();
          this.isSubmitting = false;
        },
        error: (error: any) => {
          console.error('Erro ao criar conta:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: error?.error?.message || 'Erro ao criar conta',
            life: 5000,
          });
          this.isSubmitting = false;
        },
      });
    }
  }

  confirmarDelete() {
    this.confirmationService.confirm({
      message: 'Tem certeza que deseja excluir esta conta?',
      header: 'Confirmação',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.deletar()
      }
    });
  }

  public deletar() {
    if (!this.conta || !this.conta.cdConta) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Aviso',
        detail: 'Nenhuma conta selecionada para deletar',
      });
      return;
    }

    this.isSubmitting = true;

    this.contaService.deletarConta(this.conta.cdConta).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Conta deletada com sucesso',
          life: 3000,
        });

        this.salvou.emit();
        this.resetForm();
        this.isSubmitting = false;
      },
      error: (error: any) => {
        console.error('Erro ao deletar conta:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: error?.error?.message || 'Erro ao deletar conta',
          life: 5000,
        });
        this.isSubmitting = false;
      },
    });
  }

  private resetForm() {
    this.form.reset();
    this.form.markAsPristine();
    this.form.markAsUntouched();
    this.focusedField = null;
  }
}
