export type TipoCategoria = 'Receita' | 'Despesa';

export interface Categoria {
  cdCategoria?: number;
  nmCategoria: string;
  dsCategoria?: string;
  tpCategoria: TipoCategoria;
  icone?: string;
  cor?: string;
  ativo: boolean;
}

export interface RespostaHttp<T> {
  statusCode: number;
  dados?: T;
  mensagem?: any[];
}

// Alias mantido para compatibilidade
export type ApiResponse<T> = RespostaHttp<T>;
