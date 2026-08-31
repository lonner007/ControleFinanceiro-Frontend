import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Orcamento, RespostaHttp } from './models/orcamento-models';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class OrcamentoService {
  private api = `${environment.apiBaseUrl}/Orcamentos`;
  constructor(private http: HttpClient) {}
  obterOrcamentos(mes: number, ano: number) { return this.http.get<RespostaHttp<Orcamento[]>>(`${this.api}?mes=${mes}&ano=${ano}`); }
  salvarOrcamento(orc: Orcamento) { return this.http.post<RespostaHttp<Orcamento>>(`${this.api}/Salvar`, orc); }
  deletarOrcamento(cdOrcamento: number) { return this.http.delete<RespostaHttp<Orcamento>>(`${this.api}/deletar/${cdOrcamento}`); }
}
