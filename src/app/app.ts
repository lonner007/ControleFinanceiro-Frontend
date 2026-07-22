import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { AuthService } from './auth/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule, ConfirmDialogModule, ToastModule, TooltipModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  constructor(public auth: AuthService) {}
  logout() { this.auth.logout(); }
  getIniciais(): string {
    const n = this.auth.usuarioLogado()?.nmUsuario ?? '';
    return n.split(' ').slice(0,2).map(x => x[0]).join('').toUpperCase();
  }
}
