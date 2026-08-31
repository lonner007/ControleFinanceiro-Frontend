import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { RespostaHttp, Meta } from './models/metas-models';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MetaService {

  private apiUrl = `${environment.apiBaseUrl}/Metas`;

  constructor(private http: HttpClient) {}

  obterMetas() {
    return this.http.get<RespostaHttp<Meta[]>>(this.apiUrl);
  }

  obterMetaPorId(cdMeta: number) {
    return this.http.get<RespostaHttp<Meta>>(`${this.apiUrl}/${cdMeta}`);
  }

  criarMeta(meta: Meta) {
    return this.http.post<RespostaHttp<Meta>>(`${this.apiUrl}/CriarMeta`, meta);
  }

  atualizarMeta(cdMeta: number, meta: Meta) {
    return this.http.put<RespostaHttp<Meta>>(`${this.apiUrl}/${cdMeta}`, meta);
  }

  deletarMeta(cdMeta: number) {
    return this.http.delete<RespostaHttp<Meta>>(`${this.apiUrl}/deletar/${cdMeta}`);
  }
}
