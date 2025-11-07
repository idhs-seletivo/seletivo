export interface Candidate {
  id: string;
  registration_number: string;
  NOMECOMPLETO: string;
  name?: string;
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

class GoogleSheetsService {
  private scriptUrl: string;

  constructor() {
    this.scriptUrl = 'https://script.google.com/macros/s/AKfycbzeUN52MaVkpQsORTIIiAkhHSVrlVR82UrISGLOoeyWsHCJlseTPS1Te9Mst24AcfpBhA/exec';
  }

  async fetchData(action: string, data?: any): Promise<any> {
    try {
      const url = new URL(this.scriptUrl);
      url.searchParams.append('action', action);

      if (data) {
        Object.keys(data).forEach(key => {
          url.searchParams.append(key, data[key]);
        });
      }

      const response = await fetch(url.toString(), {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Erro na comunicação com Google Apps Script:', error);
      throw error;
    }
  }

  async getCandidates(): Promise<Candidate[]> {
    const result = await this.fetchData('getCandidates');
    if (result.candidates) {
      return result.candidates.map((candidate: any) => ({
        ...candidate,
        id: candidate.CPF || candidate.id,
        registration_number: candidate.CPF || candidate.registration_number,
        name: candidate.NOMECOMPLETO || candidate.name,
        status: candidate.status || 'pendente',
      }));
    }
    return [];
  }

  async updateCandidate(cpf: string, updates: any): Promise<void> {
    await this.fetchData('updateCandidate', {
      candidateCPF: cpf,
      ...updates
    });
  }

  async deleteCandidate(cpf: string): Promise<void> {
    await this.fetchData('deleteCandidate', { candidateCPF: cpf });
  }

  async addCandidate(candidate: any): Promise<void> {
    await this.fetchData('addCandidate', candidate);
  }
}

const sheetsService = new GoogleSheetsService();

const filterData = (data: any[], filters?: CandidateFilters): any[] => {
  if (!filters) return data;

  return data.filter(item => {
    if (filters.status && item.status !== filters.status) return false;
    if (filters.AREAATUACAO && item.AREAATUACAO !== filters.AREAATUACAO) return false;
    if (filters.CARGOPRETENDIDO && item.CARGOPRETENDIDO !== filters.CARGOPRETENDIDO) return false;
    if (filters.VAGAPCD && item.VAGAPCD !== filters.VAGAPCD) return false;
    if (filters.assignedTo && item.assigned_to !== filters.assignedTo) return false;

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      const searchableFields = [
        item.NOMECOMPLETO,
        item.NOMESOCIAL,
        item.CPF,
        item.CARGOPRETENDIDO,
        item.registration_number,
        item.name
      ];

      const hasMatch = searchableFields.some(field =>
        field && field.toString().toLowerCase().includes(searchTerm)
      );

      if (!hasMatch) return false;
    }

    return true;
  });
};

const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const candidateService = {
  async getCandidates(
    page: number = 1,
    pageSize: number = 50,
    filters?: CandidateFilters,
    userId?: string
  ): Promise<PaginatedResponse<Candidate>> {
    try {
      const allData = await sheetsService.getCandidates();

      let filteredData = filterData(allData, filters);

      if (userId && filters?.assignedTo === undefined) {
        filteredData = filteredData.filter(item => item.assigned_to === userId);
      }

      filteredData.sort((a, b) => {
        const dateA = new Date(a.created_at || 0).getTime();
        const dateB = new Date(b.created_at || 0).getTime();
        return dateB - dateA;
      });

      const from = (page - 1) * pageSize;
      const to = from + pageSize;
      const paginatedData = filteredData.slice(from, to);

      return {
        data: paginatedData,
        count: filteredData.length,
        page,
        pageSize,
        totalPages: Math.ceil(filteredData.length / pageSize),
      };
    } catch (error) {
      console.error('Erro ao buscar candidatos:', error);
      throw error;
    }
  },

  async getCandidateById(id: string): Promise<Candidate | null> {
    try {
      const allData = await sheetsService.getCandidates();
      return allData.find(item => item.id === id || item.CPF === id) || null;
    } catch (error) {
      console.error('Erro ao buscar candidato por ID:', error);
      throw error;
    }
  },

  async getCandidateByCPF(cpf: string): Promise<Candidate | null> {
    try {
      const allData = await sheetsService.getCandidates();
      return allData.find(item => item.CPF === cpf) || null;
    } catch (error) {
      console.error('Erro ao buscar candidato por CPF:', error);
      throw error;
    }
  },

  async getUnassignedCandidates(
    page: number = 1,
    pageSize: number = 50
  ): Promise<PaginatedResponse<Candidate>> {
    try {
      const allData = await sheetsService.getCandidates();
      const unassignedData = allData.filter(item => !item.assigned_to);

      unassignedData.sort((a, b) => {
        if (a.priority !== b.priority) {
          return (b.priority || 0) - (a.priority || 0);
        }
        const dateA = new Date(a.created_at || 0).getTime();
        const dateB = new Date(b.created_at || 0).getTime();
        return dateA - dateB;
      });

      const from = (page - 1) * pageSize;
      const to = from + pageSize;
      const paginatedData = unassignedData.slice(from, to);

      return {
        data: paginatedData,
        count: unassignedData.length,
        page,
        pageSize,
        totalPages: Math.ceil(unassignedData.length / pageSize),
      };
    } catch (error) {
      console.error('Erro ao buscar candidatos não atribuídos:', error);
      throw error;
    }
  },

  async getStatistics(userId?: string) {
    try {
      const allData = await sheetsService.getCandidates();
      let filteredData = allData;

      if (userId) {
        filteredData = allData.filter(item => item.assigned_to === userId);
      }

      const stats = {
        total: filteredData.length,
        pendente: filteredData.filter(c => c.status === 'pendente').length,
        em_analise: filteredData.filter(c => c.status === 'em_analise').length,
        concluido: filteredData.filter(c => c.status === 'concluido').length,
        administrativa: filteredData.filter(c => c.AREAATUACAO === 'Administrativa').length,
        assistencial: filteredData.filter(c => c.AREAATUACAO === 'Assistencial').length,
        pcd: filteredData.filter(c => c.VAGAPCD === 'Sim').length,
        nao_pcd: filteredData.filter(c => c.VAGAPCD === 'Não').length,
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

      await sheetsService.updateCandidate(id, updates);
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
      const updates = {
        assigned_to: assignedTo,
        assigned_by: assignedBy,
        assigned_at: new Date().toISOString(),
        status: 'em_analise',
        updated_at: new Date().toISOString(),
      };

      await sheetsService.updateCandidate(id, updates);
    } catch (error) {
      console.error('Erro ao atribuir candidato:', error);
      throw error;
    }
  },

  async unassignCandidate(id: string): Promise<void> {
    try {
      const updates = {
        assigned_to: null,
        assigned_by: null,
        assigned_at: null,
        status: 'pendente',
        updated_at: new Date().toISOString(),
      };

      await sheetsService.updateCandidate(id, updates);
    } catch (error) {
      console.error('Erro ao remover atribuição do candidato:', error);
      throw error;
    }
  },

  async createCandidate(candidate: Omit<Candidate, 'id' | 'created_at' | 'updated_at'>): Promise<Candidate> {
    try {
      const newCandidate = {
        ...candidate,
        id: generateId(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      await sheetsService.addCandidate(newCandidate);
      return newCandidate;
    } catch (error) {
      console.error('Erro ao criar candidato:', error);
      throw error;
    }
  },

  async updateCandidate(id: string, updates: Partial<Candidate>): Promise<Candidate> {
    try {
      const fullUpdates = {
        ...updates,
        updated_at: new Date().toISOString(),
      };

      await sheetsService.updateCandidate(id, fullUpdates);

      const allData = await sheetsService.getCandidates();
      const updatedCandidate = allData.find(item => item.id === id || item.CPF === id);

      if (!updatedCandidate) {
        throw new Error('Candidato não encontrado após atualização');
      }

      return updatedCandidate;
    } catch (error) {
      console.error('Erro ao atualizar candidato:', error);
      throw error;
    }
  },

  async deleteCandidate(id: string): Promise<void> {
    try {
      await sheetsService.deleteCandidate(id);
    } catch (error) {
      console.error('Erro ao deletar candidato:', error);
      throw error;
    }
  },

  async getAreas(): Promise<string[]> {
    try {
      const allData = await sheetsService.getCandidates();
      const uniqueAreas = [...new Set(allData.map(c => c.AREAATUACAO))];
      return uniqueAreas.filter(area => area && area.trim() !== '');
    } catch (error) {
      console.error('Erro ao buscar áreas:', error);
      throw error;
    }
  },

  async getCargos(): Promise<string[]> {
    try {
      const allData = await sheetsService.getCandidates();
      const uniqueCargos = [...new Set(allData.map(c => c.CARGOPRETENDIDO))];
      return uniqueCargos.filter(cargo => cargo && cargo.trim() !== '');
    } catch (error) {
      console.error('Erro ao buscar cargos:', error);
      throw error;
    }
  },

  async getVagaPCDOptions(): Promise<string[]> {
    try {
      const allData = await sheetsService.getCandidates();
      const uniqueOptions = [...new Set(allData.map(c => c.VAGAPCD))];
      return uniqueOptions.filter(option => option && option.trim() !== '');
    } catch (error) {
      console.error('Erro ao buscar opções PCD:', error);
      throw error;
    }
  },

  async searchCandidates(query: string): Promise<Candidate[]> {
    try {
      const allData = await sheetsService.getCandidates();
      const searchTerm = query.toLowerCase();

      return allData.filter(item => {
        const searchableFields = [
          item.NOMECOMPLETO,
          item.NOMESOCIAL,
          item.CPF,
          item.CARGOPRETENDIDO,
          item.registration_number,
          item.name
        ];

        return searchableFields.some(field =>
          field && field.toString().toLowerCase().includes(searchTerm)
        );
      }).slice(0, 10);
    } catch (error) {
      console.error('Erro ao buscar candidatos:', error);
      throw error;
    }
  }
};
