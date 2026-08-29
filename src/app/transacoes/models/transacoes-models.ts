export type TipoTransacao = 'Receita' | 'Despesa' | 'Transferencia';

export interface Transacao {
  cdTransacao?: number;
  tpTransacao: TipoTransacao;
  cdConta: number;
  cdContaDestino?: number;
  cdCategoria?: number;
  vlTransacao: number;
  dtTransacao: string;
  dsTransacao?: string;
  parcelado?: boolean;
  nrParcelas?: number;
  nrParcelaAtual?: number;
  cdTransacaoPai?: number;
  nmConta?: string;
  nmContaDestino?: string;
  nmCategoria?: string;
}

export interface RespostaHttp<T> { statusCode: number; dados?: T; mensagem?: any[]; }
