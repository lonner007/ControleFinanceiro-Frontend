import { Routes } from '@angular/router';
import { authGuard, publicGuard } from './auth/guards/auth.guard';
import { AuthComponent } from './auth/auth';
import { ContasComponent } from './contas/contas';
import { CategoriasComponent } from './categorias/categorias';
import { MetasComponent } from './metas/metas';
import { TransacoesComponent } from './transacoes/transacoes';

export const routes: Routes = [
  { path: 'login', component: AuthComponent, canActivate: [publicGuard] },
  { path: 'contas', component: ContasComponent, canActivate: [authGuard] },
  { path: 'categorias', component: CategoriasComponent, canActivate: [authGuard] },
  { path: 'metas', component: MetasComponent, canActivate: [authGuard] },
  { path: 'transacoes', component: TransacoesComponent, canActivate: [authGuard] },
  { path: '', redirectTo: 'contas', pathMatch: 'full' },
  { path: '**', redirectTo: 'contas' },
];
