import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { RespostaHttp, Conta } from './models/contas-models';

@Injectable({
  providedIn: 'root'
})
export class ContaService {

  private apiUrl = 'http://localhost:5261/Api/Contas';

  constructor(private http: HttpClient) {}

  obterContas() {
    return this.http.get<RespostaHttp<Conta[]>>(this.apiUrl);
  }

  criarConta(conta: Conta) {
    return this.http.post<RespostaHttp<Conta>>(`${this.apiUrl}/CriarConta`, conta);
  }

  atualizarConta(cdConta: number, conta: Conta) {
    return this.http.put<RespostaHttp<Conta>>(`${this.apiUrl}/${cdConta}`, conta);
  }

  deletarConta(cdConta: number) {
    return this.http.delete<RespostaHttp<Conta>>(`${this.apiUrl}/deletar/${cdConta}`);
  }
}
