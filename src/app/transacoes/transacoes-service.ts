import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { RespostaHttp, Transacao } from './models/transacoes-models';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TransacaoService {

  private apiUrl = `${environment.apiBaseUrl}/Transacoes`;

  constructor(private http: HttpClient) {}

  obterTransacoes() {
    return this.http.get<RespostaHttp<Transacao[]>>(this.apiUrl);
  }

  criarTransacao(transacao: Transacao) {
    return this.http.post<RespostaHttp<Transacao>>(`${this.apiUrl}/CriarTransacao`, transacao);
  }

  atualizarTransacao(cdTransacao: number, transacao: Transacao) {
    return this.http.put<RespostaHttp<Transacao>>(`${this.apiUrl}/${cdTransacao}`, transacao);
  }

  deletarTransacao(cdTransacao: number) {
    return this.http.delete<RespostaHttp<Transacao>>(`${this.apiUrl}/deletar/${cdTransacao}`);
  }
}
