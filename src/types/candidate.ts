// ✅ TIPOS PRINCIPAIS
export interface Candidate {
  // Dados básicos do candidato
  id: string;
  registration_number: string;
  NOMECOMPLETO: string;
  NOMESOCIAL?: string;
  CPF: string;
  VAGAPCD: string;
  'LAUDO MEDICO'?: string;
  AREAATUACAO: string;
  CARGOPRETENDIDO: string;
  
  // Documentos
  CURRICULOVITAE?: string;
  DOCUMENTOSPESSOAIS?: string;
  DOCUMENTOSPROFISSIONAIS?: string;
  DIPLOMACERTIFICADO?: string;
  DOCUMENTOSCONSELHO?: string;
  ESPECIALIZACOESCURSOS?: string;
  
  // Sistema de triagem
  status: 'pendente' | 'em_analise' | 'concluido';
  status_triagem?: 'Classificado' | 'Desclassificado' | 'Revisar';
  data_hora_triagem?: string;
  analista_triagem?: string;
  assigned_to?: string;
  assigned_by?: string;
  assigned_at?: string;
  priority?: number;
  notes?: string;
  
  // Timestamps
  created_at?: string;
  updated_at?: string;
}

export interface AnalystSession {
  id: string;
  analyst_email: string;
  started_at: string;
  ended_at?: string;
  total_reviewed: number;
  status?: 'ativa' | 'finalizada';
}

export interface CandidateReview {
  id?: string;
  candidate_registration_number: string;
  analyst_email: string;
  status: 'Classificado' | 'Desclassificado' | 'Revisar';
  reviewed_at: string;
  session_id: string;
  review_duration_seconds?: number;
  review_date?: string;
  notes?: string;
}

export interface SessionMetrics {
  totalReviewed: number;
  averageTimePerCandidate: number;
  classified: number;
  disqualified: number;
  review: number;
  administrativa: number;
  assistencial: number;
  pcd: number;
}

// ✅ ENUMS
export enum CandidateStatus {
  CLASSIFICADO = 'Classificado',
  DESCLASSIFICADO = 'Desclassificado',
  REVISAR = 'Revisar'
}

export enum AreaAtuacao {
  ADMINISTRATIVA = 'Administrativa',
  ASSISTENCIAL = 'Assistencial'
}

export enum DocumentType {
  CURRICULO = 'curriculo',
  DIPLOMA = 'diploma', 
  CARTEIRA_CONSELHO = 'carteira_conselho',
  DOCUMENTOS_PESSOAIS = 'documentos_pessoais',
  DOCUMENTOS_PROFISSIONAIS = 'documentos_profissionais',
  CURSOS_ESPECIALIZACOES = 'cursos_especializacoes',
  LAUDO_MEDICO = 'laudo_medico'
}

export enum VagaPCD {
  SIM = 'Sim',
  NAO = 'Não'
}

export enum StatusSistema {
  PENDENTE = 'pendente',
  EM_ANALISE = 'em_analise',
  CONCLUIDO = 'concluido'
}

// ✅ TIPOS DE UTILIDADE
export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

// ✅ TIPOS PARA FILTROS
export interface CandidateFilters {
  status?: string;
  AREAATUACAO?: string;
  search?: string;
  assignedTo?: string;
  CARGOPRETENDIDO?: string;
  VAGAPCD?: string;
  status_triagem?: string;
}

// ✅ TIPO PARA RESPOSTA PAGINADA
export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ✅ TIPO PARA ESTATÍSTICAS
export interface Statistics {
  total: number;
  pendente: number;
  em_analise: number;
  concluido: number;
  administrativa: number;
  assistencial: number;
  pcd: number;
  nao_pcd: number;
  classificados: number;
  desclassificados: number;
  revisar: number;
}

// ✅ TIPO PARA IMPORTACAO
export interface ImportResult {
  success: number;
  failed: number;
  errors: string[];
}

// ✅ TIPO PARA ATRIBUIÇÃO
export interface AssignmentRequest {
  candidateIds: string[];
  analystId: string;
  adminId: string;
}

// ✅ EXPORT DEFAULT PARA IMPORTAÇÃO FÁCIL
export default {
  Candidate,
  AnalystSession, 
  CandidateReview,
  SessionMetrics,
  CandidateStatus,
  AreaAtuacao,
  DocumentType,
  VagaPCD,
  StatusSistema,
  CandidateFilters,
  PaginatedResponse,
  Statistics,
  ImportResult,
  AssignmentRequest
};
