import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { CredenciaisUsuario } from './credenciaisUsuario';
import { environment } from '../../environments/environment';

const ACCESS_KEY  = 'cf_access';
const USER_KEY    = 'cf_user';

export interface AuthResponse {
  accessToken: string; refreshToken: string;
  cdUsuario: number; nmUsuario: string; dsEmail: string;
}
export interface RespostaAuth { statusCode: number; dados?: AuthResponse; mensagem?: {titulo:string;descricao:string}[]; }

@Injectable({ providedIn: 'root' })
export class AuthService {
  private api = `${environment.apiBaseUrl}/Auth`;
  usuarioLogado = signal<{cdUsuario:number;nmUsuario:string;dsEmail:string}|null>(this.lerStorage());
  private accessToken: string | null = this.lerToken();

  constructor(private http: HttpClient, private router: Router) {}

  registrar(credentials: CredenciaisUsuario) {
    return this.http.post<RespostaAuth>(`${this.api}/Registrar`, credentials, { withCredentials: true }).pipe(
      tap(r => { if (r.dados) this.salvar(r.dados); }));
  }

  login(credentials: CredenciaisUsuario) {
    return this.http.post<RespostaAuth>(`${this.api}/Login`, credentials, { withCredentials: true }).pipe(
      tap(r => { if (r.dados) this.salvar(r.dados); }));
  }

  refresh() {
    const accessToken = this.getToken();
    if (!accessToken) return null;
    return this.http.post<RespostaAuth>(`${this.api}/Refresh`, {},
      { headers: { Authorization: `Bearer ${accessToken}` }, withCredentials: true }).pipe(
      tap(r => { if (r.dados) this.salvar(r.dados); }));
  }

  logout() {
    this.http.post(`${this.api}/Logout`, {}, { withCredentials: true }).subscribe({ error: () => {} });
    this.limpar();
    this.router.navigate(['/login']);
  }

  getToken() { return this.accessToken ?? this.lerToken(); }
  isLogado() { return !!this.getToken(); }

  private salvar(d: AuthResponse) {
    this.accessToken = d.accessToken;
    sessionStorage.setItem(ACCESS_KEY, d.accessToken);
    const u = { cdUsuario: d.cdUsuario, nmUsuario: d.nmUsuario, dsEmail: d.dsEmail };
    sessionStorage.setItem(USER_KEY, JSON.stringify(u));
    this.usuarioLogado.set(u);
  }

  private limpar() {
    this.accessToken = null;
    [ACCESS_KEY, USER_KEY].forEach(k => sessionStorage.removeItem(k));
    this.usuarioLogado.set(null);
  }

  private lerToken() {
    return sessionStorage.getItem(ACCESS_KEY);
  }

  private lerStorage() {
    try { const r = sessionStorage.getItem(USER_KEY); return r ? JSON.parse(r) : null; } catch { return null; }
  }
}
