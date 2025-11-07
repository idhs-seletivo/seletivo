import { User } from '../contexts/AuthContext';

export interface AssignmentRequest {
  candidateIds: string[];
  analystId: string;
  adminId: string;
}

// Serviço para comunicação com Google Sheets
class GoogleSheetsService {
  private scriptUrl: string;

  constructor(scriptUrl: string) {
    this.scriptUrl = scriptUrl;
  }

  async fetchData(action: string, data?: any): Promise<any> {
    try {
      const formData = new FormData();
      formData.append('action', action);
      
      if (data) {
        formData.append('data', JSON.stringify(data));
      }

      const response = await fetch(this.scriptUrl, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.error || 'Erro desconhecido');
      }
    } catch (error) {
      console.error('Erro na comunicação com Google Apps Script:', error);
      throw error;
    }
  }
}

// URL do seu Google Apps Script
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzeUN52MaVkpQsORTIIiAkhHSVrlVR82UrISGLOoeyWsHCJlseTPS1Te9Mst24AcfpBhA/exec';
const sheetsService = new GoogleSheetsService(SCRIPT_URL);

export async function getUsers(): Promise<User[]> {
  try {
    return await sheetsService.fetchData('getUsers');
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    throw error;
  }
}

export async function getAnalysts(): Promise<User[]> {
  try {
    const users = await sheetsService.fetchData('getUsers');
    // Filtrar apenas analistas (role 'analista')
    return users.filter((user: User) => user.role === 'analista' && user.active);
  } catch (error) {
    console.error('Erro ao buscar analistas:', error);
    throw error;
  }
}

export async function createUser(user: Omit<User, 'id' | 'active'>): Promise<User> {
  try {
    return await sheetsService.fetchData('createUser', user);
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    throw error;
  }
}

export async function updateUser(id: string, updates: Partial<User>): Promise<User> {
  try {
    return await sheetsService.fetchData('updateUser', { id, updates });
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    throw error;
  }
}

export async function deactivateUser(id: string): Promise<void> {
  try {
    await sheetsService.fetchData('deactivateUser', { id });
  } catch (error) {
    console.error('Erro ao desativar usuário:', error);
    throw error;
  }
}

export async function assignCandidates(request: AssignmentRequest): Promise<void> {
  try {
    await sheetsService.fetchData('assignCandidates', request);
  } catch (error) {
    console.error('Erro ao atribuir candidatos:', error);
    throw error;
  }
}

export async function unassignCandidates(candidateIds: string[]): Promise<void> {
  try {
    await sheetsService.fetchData('unassignCandidates', { candidateIds });
  } catch (error) {
    console.error('Erro ao remover atribuição de candidatos:', error);
    throw error;
  }
}
