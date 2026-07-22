export interface RespostaHttp<T> {
  statusCode: number;
  dados?: T;
  mensagem?: Mensagem[];
}

export interface Mensagem {
  titulo: string;
  descricao: string;
  severity: string;
}

export interface Conta {
  cdConta?: number;
  nmConta: string;
  cdTipoConta: number;
  vlSaldoAtual?: number;
  vlSaldoInicial?: number;
  dtCriacao?: string;
}

// Alias para compatibilidade
export type ApiResponse<T> = RespostaHttp<T>;
