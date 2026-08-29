export interface Orcamento {
  cdOrcamento?: number;
  cdCategoria: number;
  nmCategoria?: string;
  corCategoria?: string;
  vlLimite: number;
  vlGasto?: number;
  vlDisponivel?: number;
  percentualUsado?: number;
  nrMes: number;
  nrAno: number;
}
export interface RespostaHttp<T> { statusCode: number; dados?: T; mensagem?: any[]; }
