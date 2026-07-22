import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { MessageService } from 'primeng/api';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonModule, InputTextModule, PasswordModule],
  templateUrl: './auth.html',
  styleUrl: './auth.css',
})
export class AuthComponent {
  aba: 'login' | 'registro' = 'login';
  carregando = false;
  formLogin: FormGroup;
  formRegistro: FormGroup;

  constructor(private fb: FormBuilder, public auth: AuthService, private router: Router, private msg: MessageService) {
    this.formLogin = this.fb.group({
      dsEmail: ['', [Validators.required, Validators.email]],
      dsSenha: ['', [Validators.required, Validators.minLength(6)]],
    });
    this.formRegistro = this.fb.group({
      nmUsuario: ['', [Validators.required, Validators.minLength(2)]],
      dsEmail: ['', [Validators.required, Validators.email]],
      dsSenha: ['', [Validators.required, Validators.minLength(6)]],
      dsConfirmar: ['', Validators.required],
    }, { validators: (f: any) => f.get('dsSenha').value === f.get('dsConfirmar').value ? null : { senhasDiferentes: true } });
  }

  login() {
    if (this.formLogin.invalid) { this.formLogin.markAllAsTouched(); return; }
    this.carregando = true;
    this.auth.login(this.formLogin.value).subscribe({
      next: () => { this.msg.add({ severity: 'success', summary: 'Bem-vindo!', detail: 'Login realizado.' }); this.router.navigate(['/contas']); },
      error: (e) => { this.msg.add({ severity: 'error', summary: 'Erro', detail: e?.error?.mensagem?.[0]?.descricao ?? 'E-mail ou senha incorretos.' }); this.carregando = false; },
      complete: () => { this.carregando = false; }
    });
  }

  registrar() {
    if (this.formRegistro.invalid) { this.formRegistro.markAllAsTouched(); return; }
    const { dsConfirmar, ...credentials } = this.formRegistro.value;
    this.carregando = true;
    this.auth.registrar(credentials).subscribe({
      next: () => { this.msg.add({ severity: 'success', summary: 'Conta criada!', detail: 'Bem-vindo ao The Ledger.' }); this.router.navigate(['/contas']); },
      error: (e) => { this.msg.add({ severity: 'error', summary: 'Erro', detail: e?.error?.mensagem?.[0]?.descricao ?? 'Erro ao criar conta.' }); this.carregando = false; },
      complete: () => { this.carregando = false; }
    });
  }

  inv(form: FormGroup, campo: string) { const c = form.get(campo); return !!(c?.invalid && c?.touched); }
}
