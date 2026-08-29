import { Routes } from '@angular/router';
import { authGuard, publicGuard } from './auth/guards/auth.guard';
import { AuthComponent } from './auth/auth';
import { DashboardComponent } from './dashboard/dashboard';
import { ContasComponent } from './contas/contas';
import { CategoriasComponent } from './categorias/categorias';
import { MetasComponent } from './metas/metas';
import { TransacoesComponent } from './transacoes/transacoes';
import { OrcamentoComponent } from './orcamento/orcamento';
import { SimuladorComponent } from './simulador/simulador';

export const routes: Routes = [
  { path: 'login', component: AuthComponent, canActivate: [publicGuard] },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'contas', component: ContasComponent, canActivate: [authGuard] },
  { path: 'categorias', component: CategoriasComponent, canActivate: [authGuard] },
  { path: 'transacoes', component: TransacoesComponent, canActivate: [authGuard] },
  { path: 'metas', component: MetasComponent, canActivate: [authGuard] },
  { path: 'orcamento', component: OrcamentoComponent, canActivate: [authGuard] },
  { path: 'simulador', component: SimuladorComponent, canActivate: [authGuard] },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: 'dashboard' },
];
