export interface Meta {
  cdMeta?: number;
  nmMeta: string;
  dsMeta?: string;
  vlAlvo: number;
  vlAtual: number;
  dtPrazo: string;
  ativo: boolean;
}

export interface RespostaHttp<T> {
  statusCode: number;
  dados?: T;
  mensagem?: any[];
}

export type ApiResponse<T> = RespostaHttp<T>;
