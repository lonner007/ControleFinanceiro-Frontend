import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { CredenciaisUsuario } from './credenciaisUsuario';

const ACCESS_KEY  = 'cf_access';
const REFRESH_KEY = 'cf_refresh';
const USER_KEY    = 'cf_user';

export interface AuthResponse {
  accessToken: string; refreshToken: string;
  cdUsuario: number; nmUsuario: string; dsEmail: string;
}
export interface RespostaAuth { statusCode: number; dados?: AuthResponse; mensagem?: {titulo:string;descricao:string}[]; }

@Injectable({ providedIn: 'root' })
export class AuthService {
  private api = 'http://localhost:5261/Api/Auth';
  usuarioLogado = signal<{cdUsuario:number;nmUsuario:string;dsEmail:string}|null>(this.lerStorage());

  constructor(private http: HttpClient, private router: Router) {}

  registrar(credentials: CredenciaisUsuario) {
    return this.http.post<RespostaAuth>(`${this.api}/Registrar`, credentials).pipe(
      tap(r => { if (r.dados) this.salvar(r.dados); }));
  }

  login(credentials: CredenciaisUsuario) {
    return this.http.post<RespostaAuth>(`${this.api}/Login`, credentials).pipe(
      tap(r => { if (r.dados) this.salvar(r.dados); }));
  }

  refresh() {
    const refreshToken = localStorage.getItem(REFRESH_KEY);
    const accessToken  = localStorage.getItem(ACCESS_KEY);
    if (!refreshToken || !accessToken) return null;
    return this.http.post<RespostaAuth>(`${this.api}/Refresh`, { refreshToken },
      { headers: { Authorization: `Bearer ${accessToken}` } }).pipe(
      tap(r => { if (r.dados) this.salvar(r.dados); }));
  }

  logout() {
    this.http.post(`${this.api}/Logout`, {}).subscribe({ error: () => {} });
    this.limpar();
    this.router.navigate(['/login']);
  }

  getToken() { return localStorage.getItem(ACCESS_KEY); }
  isLogado() { return !!this.getToken(); }

  private salvar(d: AuthResponse) {
    localStorage.setItem(ACCESS_KEY, d.accessToken);
    localStorage.setItem(REFRESH_KEY, d.refreshToken);
    const u = { cdUsuario: d.cdUsuario, nmUsuario: d.nmUsuario, dsEmail: d.dsEmail };
    localStorage.setItem(USER_KEY, JSON.stringify(u));
    this.usuarioLogado.set(u);
  }

  private limpar() {
    [ACCESS_KEY, REFRESH_KEY, USER_KEY].forEach(k => localStorage.removeItem(k));
    this.usuarioLogado.set(null);
  }

  private lerStorage() {
    try { const r = localStorage.getItem(USER_KEY); return r ? JSON.parse(r) : null; } catch { return null; }
  }
}
