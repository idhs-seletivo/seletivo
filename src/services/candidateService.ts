import { supabase } from './supabaseClient';

export interface Candidate {
  id: string;
  registration_number: string;
  NOMECOMPLETO: string;
  NOMESOCIAL?: string;
  CPF: string;
  VAGAPCD: string;
  'LAUDO MEDICO'?: string;
  AREAATUACAO: string;
  CARGOPRETENDIDO: string;
  CURRICULOVITAE?: string;
  DOCUMENTOSPESSOAIS?: string;
  DOCUMENTOSPROFISSIONAIS?: string;
  DIPLOMACERTIFICADO?: string;
  DOCUMENTOSCONSELHO?: string;
  ESPECIALIZACOESCURSOS?: string;
  
  // Campos do sistema
  status: 'pendente' | 'em_analise' | 'concluido';
  assigned_to?: string;
  assigned_at?: string;
  assigned_by?: string;
  priority?: number;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface CandidateFilters {
  status?: string;
  AREAATUACAO?: string;
  search?: string;
  assignedTo?: string;
  CARGOPRETENDIDO?: string;
  VAGAPCD?: string;
}

export const candidateService = {
  async getCandidates(
    page: number = 1,
    pageSize: number = 50,
    filters?: CandidateFilters,
    userId?: string
  ): Promise<PaginatedResponse<Candidate>> {
    try {
      let query = supabase
        .from('candidates')
        .select('*', { count: 'exact' });

      // Aplicar filtros
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.AREAATUACAO) {
        query = query.eq('AREAATUACAO', filters.AREAATUACAO);
      }

      if (filters?.CARGOPRETENDIDO) {
        query = query.eq('CARGOPRETENDIDO', filters.CARGOPRETENDIDO);
      }

      if (filters?.VAGAPCD) {
        query = query.eq('VAGAPCD', filters.VAGAPCD);
      }

      if (filters?.search) {
        query = query.or(`
          NOMECOMPLETO.ilike.%${filters.search}%,
          NOMESOCIAL.ilike.%${filters.search}%,
          CPF.ilike.%${filters.search}%,
          CARGOPRETENDIDO.ilike.%${filters.search}%,
          registration_number.ilike.%${filters.search}%
        `);
      }

      if (filters?.assignedTo) {
        query = query.eq('assigned_to', filters.assignedTo);
      }

      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      query = query
        .order('created_at', { ascending: false })
        .range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        data: data || [],
        count: count || 0,
        page,
        pageSize,
        totalPages: Math.ceil((count || 0) / pageSize),
      };
    } catch (error) {
      console.error('Erro ao buscar candidatos:', error);
      throw error;
    }
  },

  async getCandidateById(id: string): Promise<Candidate | null> {
    const { data, error } = await supabase
      .from('candidates')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async getCandidateByCPF(cpf: string): Promise<Candidate | null> {
    const { data, error } = await supabase
      .from('candidates')
      .select('*')
      .eq('CPF', cpf)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async getUnassignedCandidates(
    page: number = 1,
    pageSize: number = 50
  ): Promise<PaginatedResponse<Candidate>> {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await supabase
      .from('candidates')
      .select('*', { count: 'exact' })
      .is('assigned_to', null)
      .order('priority', { ascending: false })
      .order('created_at', { ascending: true })
      .range(from, to);

    if (error) throw error;

    return {
      data: data || [],
      count: count || 0,
      page,
      pageSize,
      totalPages: Math.ceil((count || 0) / pageSize),
    };
  },

  async getStatistics(userId?: string) {
    try {
      let query = supabase.from('candidates').select('status, AREAATUACAO, VAGAPCD');

      if (userId) {
        query = query.eq('assigned_to', userId);
      }

      const { data, error } = await query;

      if (error) throw error;

      const stats = {
        total: data?.length || 0,
        pendente: data?.filter(c => c.status === 'pendente').length || 0,
        em_analise: data?.filter(c => c.status === 'em_analise').length || 0,
        concluido: data?.filter(c => c.status === 'concluido').length || 0,
        administrativa: data?.filter(c => c.AREAATUACAO === 'Administrativa').length || 0,
        assistencial: data?.filter(c => c.AREAATUACAO === 'Assistencial').length || 0,
        pcd: data?.filter(c => c.VAGAPCD === 'Sim').length || 0,
        nao_pcd: data?.filter(c => c.VAGAPCD === 'Não').length || 0,
      };

      return stats;
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
      throw error;
    }
  },

  async updateCandidateStatus(
    id: string,
    status: 'pendente' | 'em_analise' | 'concluido',
    notes?: string
  ): Promise<void> {
    try {
      const updates: any = {
        status,
        updated_at: new Date().toISOString(),
      };

      if (notes !== undefined) {
        updates.notes = notes;
      }

      const { error } = await supabase
        .from('candidates')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao atualizar status do candidato:', error);
      throw error;
    }
  },

  async assignCandidate(
    id: string,
    assignedTo: string,
    assignedBy: string
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('candidates')
        .update({
          assigned_to: assignedTo,
          assigned_by: assignedBy,
          assigned_at: new Date().toISOString(),
          status: 'em_analise',
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao atribuir candidato:', error);
      throw error;
    }
  },

  async unassignCandidate(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('candidates')
        .update({
          assigned_to: null,
          assigned_by: null,
          assigned_at: null,
          status: 'pendente',
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao remover atribuição do candidato:', error);
      throw error;
    }
  },

  async createCandidate(candidate: Omit<Candidate, 'id' | 'created_at' | 'updated_at'>): Promise<Candidate> {
    const { data, error } = await supabase
      .from('candidates')
      .insert({
        // Dados pessoais
        registration_number: candidate.registration_number,
        NOMECOMPLETO: candidate.NOMECOMPLETO,
        NOMESOCIAL: candidate.NOMESOCIAL || '',
        CPF: candidate.CPF,
        VAGAPCD: candidate.VAGAPCD,
        'LAUDO MEDICO': candidate['LAUDO MEDICO'] || '',
        
        // Dados profissionais
        AREAATUACAO: candidate.AREAATUACAO,
        CARGOPRETENDIDO: candidate.CARGOPRETENDIDO,
        
        // Documentos
        CURRICULOVITAE: candidate.CURRICULOVITAE || '',
        DOCUMENTOSPESSOAIS: candidate.DOCUMENTOSPESSOAIS || '',
        DOCUMENTOSPROFISSIONAIS: candidate.DOCUMENTOSPROFISSIONAIS || '',
        DIPLOMACERTIFICADO: candidate.DIPLOMACERTIFICADO || '',
        DOCUMENTOSCONSELHO: candidate.DOCUMENTOSCONSELHO || '',
        ESPECIALIZACOESCURSOS: candidate.ESPECIALIZACOESCURSOS || '',
        
        // Campos do sistema
        status: candidate.status || 'pendente',
        priority: candidate.priority || 0,
        notes: candidate.notes || '',
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateCandidate(id: string, updates: Partial<Candidate>): Promise<Candidate> {
    const { data, error } = await supabase
      .from('candidates')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteCandidate(id: string): Promise<void> {
    const { error } = await supabase
      .from('candidates')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async getAreas(): Promise<string[]> {
    const { data, error } = await supabase
      .from('candidates')
      .select('AREAATUACAO')
      .order('AREAATUACAO');

    if (error) throw error;

    const uniqueAreas = [...new Set(data?.map(c => c.AREAATUACAO) || [])];
    return uniqueAreas.filter(area => area && area.trim() !== '');
  },

  async getCargos(): Promise<string[]> {
    const { data, error } = await supabase
      .from('candidates')
      .select('CARGOPRETENDIDO')
      .order('CARGOPRETENDIDO');

    if (error) throw error;

    const uniqueCargos = [...new Set(data?.map(c => c.CARGOPRETENDIDO) || [])];
    return uniqueCargos.filter(cargo => cargo && cargo.trim() !== '');
  },

  async getVagaPCDOptions(): Promise<string[]> {
    const { data, error } = await supabase
      .from('candidates')
      .select('VAGAPCD')
      .order('VAGAPCD');

    if (error) throw error;

    const uniqueOptions = [...new Set(data?.map(c => c.VAGAPCD) || [])];
    return uniqueOptions.filter(option => option && option.trim() !== '');
  },

  async searchCandidates(query: string): Promise<Candidate[]> {
    const { data, error } = await supabase
      .from('candidates')
      .select('*')
      .or(`
        NOMECOMPLETO.ilike.%${query}%,
        NOMESOCIAL.ilike.%${query}%,
        CPF.ilike.%${query}%,
        CARGOPRETENDIDO.ilike.%${query}%,
        registration_number.ilike.%${query}%
      `)
      .limit(10);

    if (error) throw error;
    return data || [];
  }
};
