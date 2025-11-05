// ✅ TIPOS PRINCIPAIS
export interface Candidate {
  submissionDate: string;
  name: string;
  nome_social?: string;
  cpf: string;
  area: 'Administrativa' | 'Assistencial';
  cargoAdministrativo: string;
  cargoAssistencial: string;
  admCurriculo: string;
  admDiploma: string;
  admDocumentos: string;
  admCursos: string;
  assistCurriculo: string;
  assistDiploma: string;
  assistCarteira: string;
  assistCursos: string;
  assistDocumentos: string;
  registrationNumber: string;
  statusTriagem: 'Classificado' | 'Desclassificado' | 'Revisar';
  dataHoraTriagem: string;
  analistaTriagem: string;
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
}

export interface SessionMetrics {
  totalReviewed: number;
  averageTimePerCandidate: number;
  classified: number;
  disqualified: number;
  review: number;
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
  CARTEIRA = 'carteira',
  DOCUMENTOS_PESSOAIS = 'documentos',
  CURSOS = 'cursos'
}

// ✅ TIPOS DE UTILIDADE
export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

// ✅ EXPORT DEFAULT PARA IMPORTAÇÃO FÁCIL
export default {
  Candidate,
  AnalystSession, 
  CandidateReview,
  SessionMetrics,
  CandidateStatus,
  AreaAtuacao,
  DocumentType
};
