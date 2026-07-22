import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { RespostaHttp, Categoria } from './models/categorias-models';

@Injectable({
  providedIn: 'root'
})
export class CategoriaService {

  private apiUrl = 'http://localhost:5261/Api/Categorias';

  constructor(private http: HttpClient) {}

  obterCategorias() {
    return this.http.get<RespostaHttp<Categoria[]>>(this.apiUrl);
  }

  obterCategoriaPorId(cdCategoria: number) {
    return this.http.get<RespostaHttp<Categoria>>(`${this.apiUrl}/${cdCategoria}`);
  }

  criarCategoria(categoria: Categoria) {
    return this.http.post<RespostaHttp<Categoria>>(`${this.apiUrl}/CriarCategoria`, categoria);
  }

  atualizarCategoria(cdCategoria: number, categoria: Categoria) {
    return this.http.put<RespostaHttp<Categoria>>(`${this.apiUrl}/${cdCategoria}`, categoria);
  }

  deletarCategoria(cdCategoria: number) {
    return this.http.delete<RespostaHttp<Categoria>>(`${this.apiUrl}/deletar/${cdCategoria}`);
  }
}
